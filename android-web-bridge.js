(function () {
  "use strict";

  const DB_KEY = "scratchjr_web_bridge_db_v1";
  const FILES_KEY = "scratchjr_web_bridge_files_v1";
  const MEDIA_KEY = "scratchjr_web_bridge_media_v1";
  const TABLES = ["projects", "usershapes", "userbkgs"];

  const mediaChunkCache = new Map();
  const audioPlayers = new Map();
  let nextAudioId = 1;
  const recorderDurations = new Map();

  let recorderAudioContext = null;
  let recorderStream = null;
  let recorderSourceNode = null;
  let recorderProcessorNode = null;
  let recorderMuteNode = null;
  let recorderChunks = [];
  let recorderSampleCount = 0;
  let recorderSampleRate = 44100;
  let recorderLevel = 0;
  let recorderStartTimestamp = 0;
  let recorderSessionToken = 0;
  let recorderCurrentFile = "";
  let recorderPlaybackAudio = null;

  let db = loadDb();
  let files = loadObject(FILES_KEY, {});
  let media = loadObject(MEDIA_KEY, {});

  cleanupLegacyCaches();

  function loadObject(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveObject(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function cleanupLegacyCaches() {
    try {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          for (const registration of registrations) {
            const scriptUrl = registration.active && registration.active.scriptURL ? registration.active.scriptURL : "";
            if (scriptUrl.indexOf("/sw.js") >= 0 || scriptUrl.indexOf("scratchjr") >= 0) {
              registration.unregister();
            }
          }
        });
      }
      if ("caches" in window) {
        caches.keys().then(function (names) {
          return Promise.all(
            names.filter(function (name) {
              return String(name).toLowerCase().indexOf("scratchjr") >= 0;
            }).map(function (name) {
              return caches.delete(name);
            })
          );
        });
      }
    } catch (error) {
      // Ignore cleanup failures.
    }
  }

  function nowSqlString() {
    return new Date().toISOString().replace("T", " ").slice(0, 19);
  }

  function nowEpochString() {
    return String(Date.now());
  }

  function normalizeTableName(input) {
    return String(input || "").trim().toLowerCase();
  }

  function normalizeColumnName(input) {
    return String(input || "").trim().toLowerCase();
  }

  function loadDb() {
    const base = loadObject(DB_KEY, {});
    if (!base.tables || typeof base.tables !== "object") {
      base.tables = {};
    }
    if (!base.auto || typeof base.auto !== "object") {
      base.auto = {};
    }

    for (const table of TABLES) {
      if (!Array.isArray(base.tables[table])) {
        base.tables[table] = [];
      }

      const maxId = base.tables[table].reduce((max, row) => {
        const id = Number(row && row.id);
        return Number.isFinite(id) ? Math.max(max, id) : max;
      }, 0);

      if (!Number.isFinite(Number(base.auto[table])) || Number(base.auto[table]) <= maxId) {
        base.auto[table] = maxId + 1;
      }
    }

    return base;
  }

  function saveDb() {
    saveObject(DB_KEY, db);
  }

  function ensureTable(tableName) {
    const table = normalizeTableName(tableName);
    if (!TABLES.includes(table)) {
      throw new Error("Unsupported table: " + tableName);
    }
    return table;
  }

  function nextId(table) {
    const id = Number(db.auto[table] || 1);
    db.auto[table] = id + 1;
    return String(id);
  }

  function toLowerKeyObject(row) {
    const out = {};
    for (const key of Object.keys(row || {})) {
      const value = row[key];
      if (value === null || typeof value === "undefined") {
        continue;
      }
      out[normalizeColumnName(key)] = String(value);
    }
    return out;
  }

  function splitCsv(list) {
    return String(list || "")
      .split(",")
      .map((chunk) => chunk.trim())
      .filter(Boolean);
  }

  function parseLiteral(value) {
    const source = String(value || "").trim();
    if ((source.startsWith("'") && source.endsWith("'")) || (source.startsWith('"') && source.endsWith('"'))) {
      return source.slice(1, -1);
    }
    return source;
  }

  function valueForComparison(row, key) {
    const normalized = normalizeColumnName(key);
    if (!Object.prototype.hasOwnProperty.call(row, normalized)) {
      return null;
    }
    const value = row[normalized];
    return value === null || typeof value === "undefined" ? null : String(value);
  }

  function compileWhere(whereClause, values) {
    const clause = String(whereClause || "").trim();
    if (!clause) {
      return function () {
        return true;
      };
    }

    const parts = clause.split(/\s+AND\s+/i).map((part) => part.trim()).filter(Boolean);
    const tests = [];
    let index = 0;

    for (const part of parts) {
      let match = part.match(/^(\w+)\s+IS\s+NULL$/i);
      if (match) {
        const key = normalizeColumnName(match[1]);
        tests.push((row) => {
          const value = valueForComparison(row, key);
          return value === null || value === "";
        });
        continue;
      }

      match = part.match(/^(\w+)\s+LIKE\s+\?$/i);
      if (match) {
        const key = normalizeColumnName(match[1]);
        const pattern = String(values[index++] || "");
        const regex = new RegExp("^" + pattern.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&").replace(/%/g, ".*") + "$", "i");
        tests.push((row) => {
          const value = valueForComparison(row, key);
          return value !== null && regex.test(value);
        });
        continue;
      }

      match = part.match(/^(\w+)\s*!=\s*\?$/i);
      if (match) {
        const key = normalizeColumnName(match[1]);
        const expected = String(values[index++] || "");
        tests.push((row) => {
          const value = valueForComparison(row, key);
          return value !== expected;
        });
        continue;
      }

      match = part.match(/^(\w+)\s*=\s*\?$/i);
      if (match) {
        const key = normalizeColumnName(match[1]);
        const expected = String(values[index++] || "");
        tests.push((row) => {
          const value = valueForComparison(row, key);
          return value === expected;
        });
        continue;
      }

      match = part.match(/^(\w+)\s*!=\s*(.+)$/i);
      if (match) {
        const key = normalizeColumnName(match[1]);
        const expected = parseLiteral(match[2]);
        tests.push((row) => {
          const value = valueForComparison(row, key);
          return value !== expected;
        });
        continue;
      }

      match = part.match(/^(\w+)\s*=\s*(.+)$/i);
      if (match) {
        const key = normalizeColumnName(match[1]);
        const expected = parseLiteral(match[2]);
        tests.push((row) => {
          const value = valueForComparison(row, key);
          return value === expected;
        });
        continue;
      }

      throw new Error("Unsupported WHERE part: " + part);
    }

    return function (row) {
      for (const test of tests) {
        if (!test(row)) {
          return false;
        }
      }
      return true;
    };
  }

  function sortRows(rows, orderClause) {
    const clause = String(orderClause || "").trim();
    if (!clause) {
      return rows;
    }

    const match = clause.match(/^(\w+)\s*(asc|desc)?$/i);
    if (!match) {
      return rows;
    }

    const key = normalizeColumnName(match[1]);
    const desc = String(match[2] || "asc").toLowerCase() === "desc";

    rows.sort((a, b) => {
      const av = valueForComparison(a, key);
      const bv = valueForComparison(b, key);

      if (av === bv) {
        return 0;
      }
      if (av === null) {
        return desc ? 1 : -1;
      }
      if (bv === null) {
        return desc ? -1 : 1;
      }

      const an = Number(av);
      const bn = Number(bv);
      let cmp;
      if (Number.isFinite(an) && Number.isFinite(bn)) {
        cmp = an < bn ? -1 : 1;
      } else {
        cmp = av < bv ? -1 : 1;
      }
      return desc ? -cmp : cmp;
    });

    return rows;
  }

  function projectRows(rows, itemsClause) {
    const items = String(itemsClause || "*").trim();
    if (items === "*") {
      return rows.map((row) => toLowerKeyObject(row));
    }

    const columns = splitCsv(items).map((col) => normalizeColumnName(col));
    return rows.map((row) => {
      const out = {};
      for (const column of columns) {
        const value = valueForComparison(row, column);
        if (value !== null) {
          out[column] = value;
        }
      }
      return out;
    });
  }

  function executeQuery(statement, values) {
    const match = String(statement || "").trim().match(/^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+order\s+by\s+(.+))?$/i);
    if (!match) {
      throw new Error("Unsupported query: " + statement);
    }

    const itemsClause = match[1];
    const table = ensureTable(match[2]);
    const whereClause = match[3] || "";
    const orderClause = match[4] || "";

    const matcher = compileWhere(whereClause, values || []);
    const rows = db.tables[table].filter((row) => matcher(row));
    sortRows(rows, orderClause);
    return JSON.stringify(projectRows(rows, itemsClause));
  }

  function executeInsert(table, fieldsClause, values) {
    const fields = splitCsv(fieldsClause).map((field) => normalizeColumnName(field));
    const row = {};

    for (let i = 0; i < fields.length; i += 1) {
      row[fields[i]] = String(typeof values[i] === "undefined" || values[i] === null ? "" : values[i]);
    }

    if (!row.id) {
      row.id = nextId(table);
    }
    if (!row.ctime) {
      row.ctime = nowSqlString();
    }
    if (!row.mtime && table === "projects") {
      row.mtime = nowEpochString();
    }
    if (table === "projects") {
      if (!Object.prototype.hasOwnProperty.call(row, "deleted")) {
        row.deleted = "NO";
      }
      if (!Object.prototype.hasOwnProperty.call(row, "isgift")) {
        row.isgift = "0";
      }
    }

    db.tables[table].push(row);
    saveDb();
    return row.id;
  }

  function executeUpdate(table, setClause, whereClause, values) {
    const assignments = splitCsv(setClause);
    const updates = [];
    let index = 0;

    for (const assignment of assignments) {
      let match = assignment.match(/^(\w+)\s*=\s*\?$/i);
      if (match) {
        updates.push({
          key: normalizeColumnName(match[1]),
          value: String(typeof values[index] === "undefined" || values[index] === null ? "" : values[index]),
        });
        index += 1;
        continue;
      }

      match = assignment.match(/^(\w+)\s*=\s*(.+)$/i);
      if (match) {
        updates.push({
          key: normalizeColumnName(match[1]),
          value: parseLiteral(match[2]),
        });
        continue;
      }

      throw new Error("Unsupported assignment: " + assignment);
    }

    const matcher = compileWhere(whereClause, values.slice(index));
    let affected = 0;

    for (const row of db.tables[table]) {
      if (!matcher(row)) {
        continue;
      }
      for (const update of updates) {
        row[update.key] = update.value;
      }
      affected += 1;
    }

    if (affected > 0) {
      saveDb();
    }

    return String(affected);
  }

  function executeDelete(table, whereClause, values) {
    const matcher = compileWhere(whereClause, values);
    const before = db.tables[table].length;
    db.tables[table] = db.tables[table].filter((row) => !matcher(row));
    const deleted = before - db.tables[table].length;
    if (deleted > 0) {
      saveDb();
    }
    return String(deleted);
  }

  function executeStatement(statement, values) {
    const source = String(statement || "").trim();

    let match = source.match(/^insert\s+into\s+(\w+)\s*\(([^)]+)\)\s*values\s*\(([^)]*)\)\s*$/i);
    if (match) {
      const table = ensureTable(match[1]);
      return executeInsert(table, match[2], values || []);
    }

    match = source.match(/^update\s+(\w+)\s+set\s+(.+?)\s+where\s+(.+)$/i);
    if (match) {
      const table = ensureTable(match[1]);
      return executeUpdate(table, match[2], match[3], values || []);
    }

    match = source.match(/^delete\s+from\s+(\w+)\s+where\s+(.+)$/i);
    if (match) {
      const table = ensureTable(match[1]);
      return executeDelete(table, match[2], values || []);
    }

    throw new Error("Unsupported statement: " + statement);
  }

  function fileExt(filename) {
    const source = String(filename || "");
    const index = source.lastIndexOf(".");
    return index >= 0 ? source.slice(index + 1).toLowerCase() : "";
  }

  function mimeForExtension(ext) {
    switch (ext) {
    case "svg": return "image/svg+xml";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "gif": return "image/gif";
    case "webp": return "image/webp";
    case "mp3": return "audio/mpeg";
    case "wav": return "audio/wav";
    case "ogg": return "audio/ogg";
    case "m4a": return "audio/mp4";
    default: return "application/octet-stream";
    }
  }

  function mediaDataUrl(filename, base64Content) {
    const ext = fileExt(filename);
    const mime = mimeForExtension(ext);
    return "data:" + mime + ";base64," + base64Content;
  }

  function resolveAudioSource(file) {
    const key = String(file || "").trim();
    if (!key) {
      return "";
    }

    if (Object.prototype.hasOwnProperty.call(media, key)) {
      return mediaDataUrl(key, media[key]);
    }

    if (key.indexOf("/") >= 0) {
      return key;
    }

    // ScratchJr ships pop.mp3 at app root, not under sounds/.
    // Keep this explicit to avoid breaking sprite pop SFX.
    if (key === "pop.mp3") {
      return key;
    }

    const ext = fileExt(key);
    if (ext === "wav" || ext === "mp3" || ext === "ogg" || ext === "m4a") {
      return "sounds/" + key;
    }

    return key;
  }

  function playOneShot(file, volume) {
    const src = resolveAudioSource(file);
    if (!src) {
      return;
    }
    const audio = new Audio(src);
    audio.volume = typeof volume === "number" ? Math.max(0, Math.min(1, volume)) : 1;
    audio.play().catch(function () {
      // Ignore autoplay/user-gesture restrictions.
    });
  }

  function canUseMicrophoneRecording() {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      return false;
    }
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      return false;
    }
    if (typeof window.isSecureContext === "boolean" && !window.isSecureContext) {
      return false;
    }
    return true;
  }

  function stopStreamTracks(stream) {
    if (!stream || typeof stream.getTracks !== "function") {
      return;
    }
    for (const track of stream.getTracks()) {
      try {
        track.stop();
      } catch (error) {
        // Ignore track-stop failures.
      }
    }
  }

  function clearRecorderGraph() {
    if (recorderProcessorNode) {
      recorderProcessorNode.onaudioprocess = null;
      try {
        recorderProcessorNode.disconnect();
      } catch (error) {
        // Ignore disconnect failures.
      }
      recorderProcessorNode = null;
    }
    if (recorderSourceNode) {
      try {
        recorderSourceNode.disconnect();
      } catch (error) {
        // Ignore disconnect failures.
      }
      recorderSourceNode = null;
    }
    if (recorderMuteNode) {
      try {
        recorderMuteNode.disconnect();
      } catch (error) {
        // Ignore disconnect failures.
      }
      recorderMuteNode = null;
    }
    if (recorderStream) {
      stopStreamTracks(recorderStream);
      recorderStream = null;
    }
    if (recorderAudioContext) {
      const context = recorderAudioContext;
      recorderAudioContext = null;
      try {
        const maybePromise = context.close();
        if (maybePromise && typeof maybePromise.catch === "function") {
          maybePromise.catch(function () {
            // Ignore close failures.
          });
        }
      } catch (error) {
        // Ignore close failures.
      }
    }
  }

  function stopRecorderPlayback() {
    if (!recorderPlaybackAudio) {
      return;
    }
    const audio = recorderPlaybackAudio;
    recorderPlaybackAudio = null;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (error) {
      // Ignore browsers that block rewinding for this state.
    }
  }

  function writeAscii(view, offset, value) {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  }

  function floatTo16BitPCM(view, offset, samples) {
    for (let i = 0; i < samples.length; i += 1) {
      const clamped = Math.max(-1, Math.min(1, samples[i]));
      const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset + i * 2, int16, true);
    }
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = "";
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return window.btoa(binary);
  }

  function wavBase64FromSamples(samples, sampleRate) {
    const pcmByteLength = samples.length * 2;
    const buffer = new ArrayBuffer(44 + pcmByteLength);
    const view = new DataView(buffer);

    writeAscii(view, 0, "RIFF");
    view.setUint32(4, 36 + pcmByteLength, true);
    writeAscii(view, 8, "WAVE");
    writeAscii(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeAscii(view, 36, "data");
    view.setUint32(40, pcmByteLength, true);
    floatTo16BitPCM(view, 44, samples);

    return arrayBufferToBase64(buffer);
  }

  function mergeRecorderChunks(chunks, length) {
    const merged = new Float32Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return merged;
  }

  function buildSilence(durationSeconds, sampleRate) {
    const frameCount = Math.max(1, Math.round(Math.max(0.2, durationSeconds) * sampleRate));
    return new Float32Array(frameCount);
  }

  function removeStoredRecording(filename) {
    const key = String(filename || "");
    if (!key) {
      return;
    }
    if (Object.prototype.hasOwnProperty.call(media, key)) {
      delete media[key];
      saveObject(MEDIA_KEY, media);
    }
    recorderDurations.delete(key);
  }

  function storeRecordingFromSamples(filename, samples, sampleRate) {
    const key = String(filename || "");
    if (!key) {
      return "";
    }
    const rate = Number.isFinite(sampleRate) && sampleRate > 0 ? sampleRate : 44100;
    media[key] = wavBase64FromSamples(samples, rate);
    saveObject(MEDIA_KEY, media);
    recorderDurations.set(key, samples.length / rate);
    return key;
  }

  function ensureStoredRecording(filename) {
    const key = String(filename || "");
    if (!key) {
      return "";
    }
    if (Object.prototype.hasOwnProperty.call(media, key)) {
      return key;
    }
    return storeRecordingFromSamples(key, buildSilence(0.2, recorderSampleRate), recorderSampleRate);
  }

  function beginRecorderCapture(filename, token) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      if (token !== recorderSessionToken || filename !== recorderCurrentFile) {
        stopStreamTracks(stream);
        return;
      }

      recorderStream = stream;
      recorderAudioContext = new AudioContextCtor();
      recorderSampleRate = recorderAudioContext.sampleRate || 44100;
      recorderChunks = [];
      recorderSampleCount = 0;
      recorderLevel = 0;

      recorderSourceNode = recorderAudioContext.createMediaStreamSource(stream);
      recorderProcessorNode = recorderAudioContext.createScriptProcessor(4096, 1, 1);
      recorderMuteNode = recorderAudioContext.createGain();
      recorderMuteNode.gain.value = 0;

      recorderSourceNode.connect(recorderProcessorNode);
      recorderProcessorNode.connect(recorderMuteNode);
      recorderMuteNode.connect(recorderAudioContext.destination);

      recorderProcessorNode.onaudioprocess = function (event) {
        const input = event.inputBuffer.getChannelData(0);
        if (!input || input.length === 0) {
          return;
        }

        recorderChunks.push(new Float32Array(input));
        recorderSampleCount += input.length;

        let sumSquares = 0;
        for (let i = 0; i < input.length; i += 1) {
          sumSquares += input[i] * input[i];
        }
        const rms = Math.sqrt(sumSquares / input.length);
        recorderLevel = Math.max(0, Math.min(1, rms * 2.5));

        const output = event.outputBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i += 1) {
          output[i] = 0;
        }
      };

      if (recorderAudioContext.state === "suspended") {
        recorderAudioContext.resume().catch(function () {
          // Ignore resume failures.
        });
      }
    }).catch(function () {
      if (token !== recorderSessionToken || filename !== recorderCurrentFile) {
        return;
      }
      recorderLevel = 0;
      clearRecorderGraph();
    });
  }

  function startRecorderCapture(filename) {
    recorderSessionToken += 1;
    const token = recorderSessionToken;
    beginRecorderCapture(filename, token);
  }

  function finalizeRecording(filename) {
    const key = String(filename || "");
    if (!key) {
      return "-1";
    }

    const rate = Number.isFinite(recorderSampleRate) && recorderSampleRate > 0 ? recorderSampleRate : 44100;
    const elapsedSeconds = recorderStartTimestamp > 0 ? (Date.now() - recorderStartTimestamp) / 1000 : 0;

    let samples;
    if (recorderSampleCount > 0 && recorderChunks.length > 0) {
      samples = mergeRecorderChunks(recorderChunks, recorderSampleCount);
    } else {
      samples = buildSilence(elapsedSeconds, rate);
    }

    recorderChunks = [];
    recorderSampleCount = 0;
    recorderLevel = 0;
    recorderStartTimestamp = 0;

    return storeRecordingFromSamples(key, samples, rate);
  }

  function md5(input) {
    function cmn(q, a, b, x, s, t) {
      a = add32(add32(a, q), add32(x, t));
      return add32((a << s) | (a >>> (32 - s)), b);
    }
    function ff(a, b, c, d, x, s, t) {
      return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function gg(a, b, c, d, x, s, t) {
      return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function hh(a, b, c, d, x, s, t) {
      return cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function ii(a, b, c, d, x, s, t) {
      return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }
    function md5cycle(x, k) {
      let a = x[0];
      let b = x[1];
      let c = x[2];
      let d = x[3];

      a = ff(a, b, c, d, k[0], 7, -680876936);
      d = ff(d, a, b, c, k[1], 12, -389564586);
      c = ff(c, d, a, b, k[2], 17, 606105819);
      b = ff(b, c, d, a, k[3], 22, -1044525330);
      a = ff(a, b, c, d, k[4], 7, -176418897);
      d = ff(d, a, b, c, k[5], 12, 1200080426);
      c = ff(c, d, a, b, k[6], 17, -1473231341);
      b = ff(b, c, d, a, k[7], 22, -45705983);
      a = ff(a, b, c, d, k[8], 7, 1770035416);
      d = ff(d, a, b, c, k[9], 12, -1958414417);
      c = ff(c, d, a, b, k[10], 17, -42063);
      b = ff(b, c, d, a, k[11], 22, -1990404162);
      a = ff(a, b, c, d, k[12], 7, 1804603682);
      d = ff(d, a, b, c, k[13], 12, -40341101);
      c = ff(c, d, a, b, k[14], 17, -1502002290);
      b = ff(b, c, d, a, k[15], 22, 1236535329);

      a = gg(a, b, c, d, k[1], 5, -165796510);
      d = gg(d, a, b, c, k[6], 9, -1069501632);
      c = gg(c, d, a, b, k[11], 14, 643717713);
      b = gg(b, c, d, a, k[0], 20, -373897302);
      a = gg(a, b, c, d, k[5], 5, -701558691);
      d = gg(d, a, b, c, k[10], 9, 38016083);
      c = gg(c, d, a, b, k[15], 14, -660478335);
      b = gg(b, c, d, a, k[4], 20, -405537848);
      a = gg(a, b, c, d, k[9], 5, 568446438);
      d = gg(d, a, b, c, k[14], 9, -1019803690);
      c = gg(c, d, a, b, k[3], 14, -187363961);
      b = gg(b, c, d, a, k[8], 20, 1163531501);
      a = gg(a, b, c, d, k[13], 5, -1444681467);
      d = gg(d, a, b, c, k[2], 9, -51403784);
      c = gg(c, d, a, b, k[7], 14, 1735328473);
      b = gg(b, c, d, a, k[12], 20, -1926607734);

      a = hh(a, b, c, d, k[5], 4, -378558);
      d = hh(d, a, b, c, k[8], 11, -2022574463);
      c = hh(c, d, a, b, k[11], 16, 1839030562);
      b = hh(b, c, d, a, k[14], 23, -35309556);
      a = hh(a, b, c, d, k[1], 4, -1530992060);
      d = hh(d, a, b, c, k[4], 11, 1272893353);
      c = hh(c, d, a, b, k[7], 16, -155497632);
      b = hh(b, c, d, a, k[10], 23, -1094730640);
      a = hh(a, b, c, d, k[13], 4, 681279174);
      d = hh(d, a, b, c, k[0], 11, -358537222);
      c = hh(c, d, a, b, k[3], 16, -722521979);
      b = hh(b, c, d, a, k[6], 23, 76029189);
      a = hh(a, b, c, d, k[9], 4, -640364487);
      d = hh(d, a, b, c, k[12], 11, -421815835);
      c = hh(c, d, a, b, k[15], 16, 530742520);
      b = hh(b, c, d, a, k[2], 23, -995338651);

      a = ii(a, b, c, d, k[0], 6, -198630844);
      d = ii(d, a, b, c, k[7], 10, 1126891415);
      c = ii(c, d, a, b, k[14], 15, -1416354905);
      b = ii(b, c, d, a, k[5], 21, -57434055);
      a = ii(a, b, c, d, k[12], 6, 1700485571);
      d = ii(d, a, b, c, k[3], 10, -1894986606);
      c = ii(c, d, a, b, k[10], 15, -1051523);
      b = ii(b, c, d, a, k[1], 21, -2054922799);
      a = ii(a, b, c, d, k[8], 6, 1873313359);
      d = ii(d, a, b, c, k[15], 10, -30611744);
      c = ii(c, d, a, b, k[6], 15, -1560198380);
      b = ii(b, c, d, a, k[13], 21, 1309151649);
      a = ii(a, b, c, d, k[4], 6, -145523070);
      d = ii(d, a, b, c, k[11], 10, -1120210379);
      c = ii(c, d, a, b, k[2], 15, 718787259);
      b = ii(b, c, d, a, k[9], 21, -343485551);

      x[0] = add32(a, x[0]);
      x[1] = add32(b, x[1]);
      x[2] = add32(c, x[2]);
      x[3] = add32(d, x[3]);
    }

    function md5blk(s) {
      const md5blks = [];
      for (let i = 0; i < 64; i += 4) {
        md5blks[i >> 2] = s.charCodeAt(i)
          + (s.charCodeAt(i + 1) << 8)
          + (s.charCodeAt(i + 2) << 16)
          + (s.charCodeAt(i + 3) << 24);
      }
      return md5blks;
    }

    function md51(s) {
      const n = s.length;
      const state = [1732584193, -271733879, -1732584194, 271733878];
      let i;
      for (i = 64; i <= n; i += 64) {
        md5cycle(state, md5blk(s.substring(i - 64, i)));
      }
      s = s.substring(i - 64);
      const tail = new Array(16).fill(0);
      for (i = 0; i < s.length; i += 1) {
        tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
      }
      tail[i >> 2] |= 0x80 << ((i % 4) << 3);
      if (i > 55) {
        md5cycle(state, tail);
        for (i = 0; i < 16; i += 1) {
          tail[i] = 0;
        }
      }
      tail[14] = n * 8;
      md5cycle(state, tail);
      return state;
    }

    function rhex(n) {
      let s = "";
      for (let j = 0; j < 4; j += 1) {
        s += ((n >> (j * 8 + 4)) & 0x0f).toString(16) + ((n >> (j * 8)) & 0x0f).toString(16);
      }
      return s;
    }

    function hex(x) {
      return x.map(rhex).join("");
    }

    function add32(a, b) {
      return (a + b) & 0xffffffff;
    }

    return hex(md51(unescape(encodeURIComponent(String(input || "")))));
  }

  window.AndroidInterface = {
    notifySplashDone: function () {},
    notifyDoneLoading: function () {},
    notifyEditorDoneLoading: function () {},

    audio_sndfx: function (file) {
      playOneShot(file, 1);
    },

    audio_sndfxwithvolume: function (file, volume) {
      playOneShot(file, Number(volume));
    },

    audio_play: function (file, volume) {
      const src = resolveAudioSource(file);
      if (!src) {
        return 0;
      }
      const id = nextAudioId;
      nextAudioId += 1;
      const audio = new Audio(src);
      audio.volume = Number.isFinite(Number(volume)) ? Math.max(0, Math.min(1, Number(volume))) : 1;
      audio.play().catch(function () {
        // Ignore autoplay/user-gesture restrictions.
      });
      audio.addEventListener("ended", function () {
        audioPlayers.delete(id);
      });
      audioPlayers.set(id, audio);
      return id;
    },

    audio_isplaying: function (soundId) {
      const audio = audioPlayers.get(Number(soundId));
      return !!(audio && !audio.paused && !audio.ended);
    },

    audio_stop: function (soundId) {
      const audio = audioPlayers.get(Number(soundId));
      if (!audio) {
        return;
      }
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch (error) {
        // Ignore browsers that block rewinding for this state.
      }
      audioPlayers.delete(Number(soundId));
    },

    database_query: function (json) {
      try {
        const payload = JSON.parse(json);
        return executeQuery(payload.stmt, payload.values || []);
      } catch (error) {
        return "SQL error: " + error.message;
      }
    },

    database_stmt: function (json) {
      try {
        const payload = JSON.parse(json);
        return executeStatement(payload.stmt, payload.values || []);
      } catch (error) {
        return "SQL error: " + error.message;
      }
    },

    io_getmd5: function (str) {
      return md5(str);
    },

    io_getsettings: function () {
      return ",," + (canUseMicrophoneRecording() ? "YES" : "NO") + ",YES";
    },

    io_cleanassets: function () {
      return "1";
    },

    io_setfile: function (filename, base64ContentStr) {
      files[String(filename)] = String(base64ContentStr || "");
      saveObject(FILES_KEY, files);
      return String(filename);
    },

    io_getfile: function (filename) {
      return files[String(filename)] || "";
    },

    io_setmedia: function (base64ContentStr, extension) {
      const ext = String(extension || "").toLowerCase();
      const md5sum = md5(base64ContentStr || "");
      const filename = md5sum + "." + ext;
      media[filename] = String(base64ContentStr || "");
      saveObject(MEDIA_KEY, media);
      return filename;
    },

    io_setmedianame: function (base64ContentStr, key, ext) {
      const filename = String(key || "") + "." + String(ext || "");
      media[filename] = String(base64ContentStr || "");
      saveObject(MEDIA_KEY, media);
      return filename;
    },

    io_getmedia: function (filename) {
      return media[String(filename)] || "";
    },

    io_getmediadata: function (key, offset, length) {
      const source = mediaChunkCache.get(String(key)) || "";
      const start = Math.max(0, Number(offset) || 0);
      const len = Math.max(0, Number(length) || 0);
      return source.substring(start, start + len);
    },

    io_getmedialen: function (file, key) {
      const source = media[String(file)] || "";
      mediaChunkCache.set(String(key), source);
      return source.length;
    },

    io_getmediadone: function (key) {
      mediaChunkCache.delete(String(key));
      return "1";
    },

    io_remove: function (filename) {
      const key = String(filename);
      delete media[key];
      delete files[key];
      saveObject(MEDIA_KEY, media);
      saveObject(FILES_KEY, files);
      recorderDurations.delete(key);
      if (recorderCurrentFile === key) {
        recorderCurrentFile = "";
      }
      return "1";
    },

    recordsound_recordstart: function () {
      if (!canUseMicrophoneRecording()) {
        return "-1";
      }

      stopRecorderPlayback();
      clearRecorderGraph();

      if (recorderCurrentFile) {
        removeStoredRecording(recorderCurrentFile);
      }

      recorderCurrentFile = "recording_" + Date.now() + "_" + Math.floor(Math.random() * 1000000) + ".wav";
      recorderChunks = [];
      recorderSampleCount = 0;
      recorderSampleRate = 44100;
      recorderLevel = 0;
      recorderStartTimestamp = Date.now();

      startRecorderCapture(recorderCurrentFile);
      return recorderCurrentFile;
    },

    recordsound_recordstop: function () {
      if (!recorderCurrentFile) {
        return "-1";
      }

      recorderSessionToken += 1;
      clearRecorderGraph();

      return finalizeRecording(recorderCurrentFile);
    },

    recordsound_volume: function () {
      return Number.isFinite(recorderLevel) ? recorderLevel : 0;
    },

    recordsound_startplay: function () {
      if (!recorderCurrentFile) {
        return "-1";
      }

      const key = ensureStoredRecording(recorderCurrentFile);
      if (!key) {
        return "-1";
      }

      stopRecorderPlayback();

      const src = resolveAudioSource(key);
      if (!src) {
        return "-1";
      }

      const audio = new Audio(src);
      audio.addEventListener("loadedmetadata", function () {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          recorderDurations.set(key, audio.duration);
        }
      });
      audio.addEventListener("ended", function () {
        if (recorderPlaybackAudio === audio) {
          recorderPlaybackAudio = null;
        }
      });
      audio.play().catch(function () {
        // Ignore autoplay/user-gesture restrictions.
      });
      recorderPlaybackAudio = audio;

      const duration = recorderDurations.get(key);
      return Number.isFinite(duration) && duration > 0 ? duration : 0.1;
    },

    recordsound_stopplay: function () {
      stopRecorderPlayback();
      return "1";
    },

    recordsound_recordclose: function (shouldSave) {
      const keepRecording = String(shouldSave || "").toUpperCase() === "YES";

      stopRecorderPlayback();
      recorderSessionToken += 1;
      clearRecorderGraph();
      recorderLevel = 0;
      recorderChunks = [];
      recorderSampleCount = 0;
      recorderStartTimestamp = 0;

      if (recorderCurrentFile) {
        if (keepRecording) {
          ensureStoredRecording(recorderCurrentFile);
        } else {
          removeStoredRecording(recorderCurrentFile);
        }
      }

      recorderCurrentFile = "";
      return "1";
    },

    scratchjr_cameracheck: function () {
      return "0";
    },

    scratchjr_has_multiple_cameras: function () {
      return false;
    },

    scratchjr_startfeed: function () {
      return "-1";
    },

    scratchjr_stopfeed: function () {
      return "1";
    },

    scratchjr_choosecamera: function () {
      return "-1";
    },

    scratchjr_captureimage: function (onCameraCaptureComplete) {
      const callbackName = String(onCameraCaptureComplete || "");
      if (callbackName && typeof window[callbackName] === "function") {
        window.setTimeout(function () {
          window[callbackName]("error getting a still");
        }, 0);
      }
    },

    scratchjr_getgettingstartedvideopath: function () {
      return "assets/lobby/intro.mp4";
    },

    scratchjr_stopserver: function () {
      return "1";
    },

    scratchjr_setsoftkeyboardscrolllocation: function () {},
    scratchjr_forceShowKeyboard: function () {},
    scratchjr_forceHideKeyboard: function () {},

    createZipForProject: function (projectData, metadataJson, name) {
      void projectData;
      void metadataJson;
      return String(name || "project") + ".sjr";
    },

    sendSjrUsingShareDialog: function () {},

    deviceName: function () {
      return "Web";
    },

    analyticsEvent: function () {},
    setAnalyticsPlacePref: function () {},
    setAnalyticsPref: function () {},
  };
})();
