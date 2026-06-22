"use strict";
/**
 * JS Hook Util
 * example: https://codepen.io/etherdream/pen/WNoQQbG?editors=0012
 */
var Hook;
(function (Hook) {
    /**
     * hook function
     */
    function func(obj, key, factory) {
        const oldFn = obj[key];
        if (!oldFn) {
            return false;
        }
        const newFn = factory(oldFn);
        obj[key] = newFn;
        return true;
    }
    Hook.func = func;
    /**
     * hook property
     */
    function prop(obj, key, getterFactory, setterFactory) {
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if (!desc) {
            return false;
        }
        if (getterFactory) {
            func(desc, 'get', getterFactory);
        }
        if (setterFactory) {
            func(desc, 'set', setterFactory);
        }
        Object.defineProperty(obj, key, desc);
        return true;
    }
    Hook.prop = prop;
})(Hook || (Hook = {}));
const IS_DEBUG = typeof RELEASE === 'undefined';
const DEFAULT_PARAMS = `
@__default__
 expires=30s
 mime=auto
 open_timeout=10s
 valid_status=200
`;
const DEFAULT_MANIFEST_PATH = '/freecdn-manifest.txt';
const MY_URL = location.href;
const MY_HOST = location.host;
const MY_ORIGIN = location.origin;
const ROOT_PATH = MY_ORIGIN + '/';
const INTERNAL_DIR = 'freecdn-internal/' + (IS_DEBUG ? 'dev' : VER);
const INTERNAL_PATH = new URL(INTERNAL_DIR, ROOT_PATH).pathname;
const REG_IMG_EXTS = /\.(?:jpg|jpeg|png|apng|gif|ico|bmp)$/i;
const NATIVE_FETCH = fetch;
const EMPTY_BUF = new Uint8Array(0);
const CRYPTO = crypto.subtle;
let gInited;
async function globalInit() {
    if (gInited) {
        return gInited;
    }
    gInited = promisex();
    await CacheManager.init();
    await Network.init();
    UrlConf.init();
    gInited.resolve();
    gInited = true;
}
class ParamError extends Error {
    constructor(message) {
        super(message);
    }
}
class ParamBase {
    onRequest(reqArgs, fileLoader) {
    }
    onResponse(resArgs, fileLoader, rawRes) {
    }
    onData(chunk) {
        return chunk;
    }
    onEnd(chunk) {
        return chunk;
    }
    onError(error) {
    }
    onAbort(reason) {
    }
}
var KeyManager;
(function (KeyManager) {
    let mKey;
    async function set(keyBase64) {
        const keyBin = base64Decode(keyBase64);
        if (!keyBin) {
            return;
        }
        mKey = await CRYPTO.importKey('spki', keyBin, {
            name: 'ECDSA',
            namedCurve: 'P-256',
        }, false, ['verify']);
    }
    KeyManager.set = set;
    async function verify(data) {
        if (!mKey) {
            return false;
        }
        const linePos = data.lastIndexOf(10); // 10 = '\n'
        const lineBin = data.subarray(linePos + 1);
        const lineTxt = bytesToUtf8(lineBin);
        const m = lineTxt.match(/# SIGN: ([A-Za-z0-9+/=]{88})$/);
        if (!m) {
            return false;
        }
        const signTxt = m[1];
        const signBin = base64Decode(signTxt);
        const dataBin = data.subarray(0, linePos);
        return await CRYPTO.verify({
            name: 'ECDSA',
            hash: {
                name: 'SHA-256'
            },
        }, mKey, signBin, dataBin);
    }
    KeyManager.verify = verify;
})(KeyManager || (KeyManager = {}));
//
// 匹配清单中的文件块。例如：
//
// (http://foo/path/to/file)
//    ...
// (/path/to/file)
//    ...
// (@config)
//    ...
// 其中 $0 为文件名，内容部分只匹配不捕获，之后通过 lastIndex 截取
//
const REG_HEAD_LINE = /^(?:\/|https?:|@).*/mg;
class Manifest {
    constructor() {
        this.urlFileMap = new Map();
    }
    has(key) {
        return this.urlFileMap.has(key);
    }
    get(key) {
        return this.urlFileMap.get(key);
    }
    getParams(name) {
        const fileConf = this.get(name);
        if (fileConf) {
            fileConf.parse();
            return fileConf.params;
        }
    }
    async parse(txt) {
        this.parseFile(txt + DEFAULT_PARAMS);
        const inc = this.urlFileMap.get('@include');
        if (inc) {
            const cdn = new FreeCDN();
            cdn.manifest = this;
            const urls = inc.getLines();
            const rets = urls.map(cdn.fetchText, cdn);
            const txts = await Promise.all(rets);
            txts.forEach(this.parseFile, this);
        }
    }
    parseFile(txt) {
        // lazy parse
        let name = '';
        let last = 0;
        for (;;) {
            const m = REG_HEAD_LINE.exec(txt);
            if (last > 0) {
                if (name[0] !== '@') {
                    name = toRelUrl(name);
                }
                const curr = m ? m.index : txt.length;
                const part = txt.substring(last, curr);
                const conf = new FileConf(name, part);
                this.urlFileMap.set(name, conf);
            }
            if (!m) {
                break;
            }
            name = m[0];
            last = REG_HEAD_LINE.lastIndex;
        }
        const m0 = this.getParams('@__default__');
        const m1 = this.getParams('@global');
        this.globalParams = m1 ? new Map([...m0, ...m1]) : m0;
    }
}
class UrlConf {
    constructor(fullUrl, fileParams) {
        this.fileParams = fileParams;
        [this.url, this.frag] = getPair(toRelUrl(fullUrl), '#');
    }
    static init() {
        // 为了让代码更简洁，这里没有逐一引用各个参数对应的文件
        // 如果该列表定义在全局，会出现依赖顺序的问题
        this.nameClassMap = {
            // 参数优先级（越前面的参数优先执行）
            'data': ParamData,
            'bundle': ParamBundle,
            'open_timeout': ParamOpenTimeout,
            'recv_timeout': ParamRecvTimeout,
            'referrer_policy': ParamReferrerPolicy,
            'req_headers': ParamReqHeaders,
            'valid_status': ParamValidStatus,
            'headers': ParamHeaders,
            'expires': ParamExpires,
            'mime': ParamMime,
            'charset': ParamCharset,
            'pos': ParamPos,
            'size': ParamSize,
            'xor': ParamXor,
            'br': ParamBr,
            'prefix': ParamPrefix,
            'suffix': ParamSuffix,
            'hash': ParamHash,
            'stream': ParamStream,
        };
        Object.values(this.nameClassMap).forEach((cls, i) => {
            cls.priority = i;
        });
    }
    parse(manifest) {
        // TODO: cache result
        const params = new Map();
        // 参数优先级: 全局参数 < 站点参数 < 文件参数 < URL 参数
        mergeMap(params, manifest.globalParams);
        // 站点参数
        const host = this.url[0] === '/' ? MY_HOST : getHostFromUrl(this.url);
        const hostParams = manifest.getParams('@host ' + host);
        if (hostParams) {
            mergeMap(params, hostParams);
        }
        // 文件参数
        mergeMap(params, this.fileParams);
        // URL 参数（定义在 # 后面）
        if (this.frag) {
            const urlParams = new URLSearchParams(this.frag);
            mergeMap(params, urlParams);
        }
        const mods = [];
        for (const [k, v] of params) {
            const cls = UrlConf.nameClassMap[k];
            if (!cls) {
                console.warn('[FreeCDN/UrlConf] unknown param:', k);
                continue;
            }
            const ret = cls.parseConf(v);
            if (ret === undefined) {
                continue;
            }
            if (typeof ret === 'string') {
                console.warn('[FreeCDN/UrlConf] parseConf failed. mod:', k, 'err:', ret, 'conf:', v);
                continue;
            }
            const obj = new cls(...ret);
            mods.push(obj);
        }
        mods.sort((a, b) => a.constructor.priority -
            b.constructor.priority);
        return mods;
    }
}
class UrlLoader {
    constructor(url, paramMods) {
        this.url = url;
        this.paramMods = paramMods;
        this.abortCtrl = new AbortController();
        this.isNetErr = false;
        this.isDone = false;
        this.isAborted = false;
        this.bytesRead = 0;
    }
    async request(fileLoader) {
        let err;
        try {
            err = await this.requestUnsafe(fileLoader);
        }
        catch (e) {
            console.assert(e instanceof ParamError, e);
            err = e;
        }
        if (err && !this.isAborted) {
            for (const mod of this.paramMods) {
                mod.onError(err);
            }
            this.onError(err);
            // TODO: network.addError(err)
            if (!this.isNetErr) {
                this.abort(err);
            }
        }
    }
    async requestUnsafe(fileLoader) {
        const { rawReq } = fileLoader;
        const { method } = rawReq;
        const reqArgs = {
            method,
            referrer: rawReq.referrer,
            referrerPolicy: 'same-origin',
            headers: new Headers(),
        };
        if (method === 'POST' || method === 'PUT') {
            reqArgs.body = await rawReq.clone().arrayBuffer();
        }
        let res;
        for (const mod of this.paramMods) {
            // 可直接返回响应（例如 data 参数、bundle 参数）
            const ret = mod.onRequest(reqArgs, fileLoader);
            if (ret) {
                // await is slow
                // https://gist.github.com/EtherDream/52649e4939008e149d0cb3a944c055b7
                res = isPromise(ret) ? await ret : ret;
                if (res) {
                    break;
                }
            }
        }
        if (!res) {
            reqArgs.signal = this.abortCtrl.signal;
            const req = new Request(this.url, reqArgs);
            try {
                res = await Network.fetch(req);
            }
            catch (err) {
                this.isNetErr = true;
                return err;
            }
        }
        const resArgs = {
            status: res.status,
            statusText: res.statusText,
            headers: new Headers(),
        };
        for (const mod of this.paramMods) {
            mod.onResponse(resArgs, fileLoader, res);
        }
        this.onResponse(resArgs);
        if (!res.body) {
            return new Error('cors error');
        }
        const reader = res.body.getReader();
        let buf;
        READ: for (;;) {
            try {
                const { value } = await reader.read();
                if (!value) {
                    break;
                }
                buf = value;
            }
            catch (err) {
                this.isNetErr = true;
                return err;
            }
            for (const mod of this.paramMods) {
                const ret = mod.onData(buf);
                buf = isPromise(ret) ? await ret : ret;
                if (buf.length === 0) {
                    continue READ;
                }
            }
            if (buf.length > 0) {
                this.pauseSignal && await this.pauseSignal;
                this.bytesRead += buf.length;
                this.onData(buf);
            }
        } // READ NEXT
        this.isDone = true;
        buf = EMPTY_BUF;
        for (const mod of this.paramMods) {
            const ret = mod.onEnd(buf);
            buf = isPromise(ret) ? await ret : ret;
        }
        if (buf.length > 0) {
            this.pauseSignal && await this.pauseSignal;
            this.bytesRead += buf.length;
            this.onData(buf);
        }
        this.onEnd();
    }
    pause() {
        console.assert(!this.pauseSignal);
        this.pauseSignal = promisex();
    }
    resume() {
        this.pauseSignal?.resolve();
        this.pauseSignal = undefined;
    }
    abort(reason) {
        if (this.isDone) {
            return;
        }
        this.isAborted = true;
        this.abortCtrl.abort();
        for (const mod of this.paramMods) {
            mod.onAbort(reason);
        }
    }
}
// 匹配缩进开头的行，捕获 trim 后的内容（排除 `#` 注释行）
const REG_SUB_LINE = /^\s+([^#\s].+?)\s*$/mg;
class FileConf {
    constructor(name, text) {
        this.name = name;
        this.text = text;
    }
    getLines() {
        const lines = [];
        for (;;) {
            const m = REG_SUB_LINE.exec(this.text);
            if (!m) {
                break;
            }
            lines.push(m[1]);
        }
        this.text = '';
        return lines;
    }
    parse() {
        if (this.text === '') {
            return;
        }
        const urlConfs = [];
        const params = new Map();
        for (const line of this.getLines()) {
            if (/^https?:|^\//.test(line)) {
                const urlConf = new UrlConf(line, params);
                urlConfs.push(urlConf);
            }
            else {
                const [key, val] = getPair(line, '=');
                if (val === undefined) {
                    console.warn('[FreeCDN/FileConf] missing param value:', line);
                    continue;
                }
                params.set(key, val);
            }
        }
        this.params = params;
        this.urlConfs = urlConfs;
    }
}
const FILE_BACKUP_PARAMS = [
    'open_timeout',
    'recv_timeout',
    'hash',
    'req_headers',
    'valid_status',
];
class FileLoaderError extends Error {
    constructor(message) {
        super(message);
    }
}
class FileLoader {
    constructor(fileConf, rawReq, manifest, weightConf, range, suffix) {
        this.fileConf = fileConf;
        this.rawReq = rawReq;
        this.manifest = manifest;
        this.weightConf = weightConf;
        this.range = range;
        this.suffix = suffix;
        this.urlLoaderSet = new Set();
        this.delayTid = 0;
        this.urlErrs = [];
        this.hasRange = false;
        this.opened = false;
        this.closed = false;
        this.bytesRead = 0;
        if (range) {
            const r = this.parseReqRange(range);
            if (r) {
                [this.rangeBegin, this.rangeEnd] = r;
                this.hasRange = true;
                this.bytesRead = this.rangeBegin;
            }
            const fileSize = fileConf.params.get('size');
            if (fileSize) {
                this.fileSize = +fileSize;
            }
        }
        // 原始 URL 作为后备资源
        let backupParams;
        if (fileConf.params.has('data') || fileConf.params.has('bundle')) {
            // 使用内嵌数据时，可保留所有参数
            backupParams = fileConf.params;
        }
        else {
            // 使用原始 URL 时禁止修改内容，例如 pos、xor 等操作
            // 因此只保留白名单中的参数
            const map = new Map();
            for (const k of FILE_BACKUP_PARAMS) {
                const v = fileConf.params.get(k);
                if (v !== undefined) {
                    map.set(k, v);
                }
            }
            backupParams = map;
        }
        const backupUrlConf = new UrlConf(fileConf.name, backupParams);
        this.urlConfs = fileConf.urlConfs.concat(backupUrlConf);
    }
    parseReqRange(range) {
        // 目前只考虑 `bytes=begin-end` 和 `bytes=begin-` 格式
        const m = range.match(/bytes=(\d+)-(\d*)/i);
        if (!m) {
            return;
        }
        const begin = +m[1];
        const end = +m[2]; // +'' === 0
        if (end !== 0 && end <= begin) {
            return;
        }
        return [begin, end];
    }
    buildResRange(resArgs) {
        let end = 0;
        if (this.rangeEnd !== 0) {
            end = this.rangeEnd - 1;
        }
        else if (this.fileSize) {
            end = this.fileSize - 1;
        }
        const val = 'bytes ' + this.rangeBegin + '-' + end + '/' + (this.fileSize || '*');
        // TODO: status 416
        resArgs.status = 206;
        resArgs.headers.set('content-range', val);
    }
    open() {
        this.loadNextUrl();
    }
    pause() {
        for (const urlLoader of this.urlLoaderSet) {
            urlLoader.pause();
        }
    }
    resume() {
        for (const urlLoader of this.urlLoaderSet) {
            urlLoader.resume();
        }
    }
    abort(reason) {
        for (const urlLoader of this.urlLoaderSet) {
            urlLoader.abort(reason);
        }
        if (this.delayTid !== 0) {
            clearTimeout(this.delayTid);
        }
    }
    getNextUrl() {
        const { urlConfs } = this;
        const lastIndex = urlConfs.length - 1;
        if (lastIndex === -1) {
            return;
        }
        const now = getTimeSec();
        let weight = -10000;
        let index = 0;
        urlConfs.forEach((conf, i) => {
            const w = Network.getUrlWeight(conf.url, now, this.weightConf);
            if (w > weight) {
                weight = w;
                index = i;
            }
        });
        // 删除 urlConfs[index]
        const conf = urlConfs[index];
        urlConfs[index] = urlConfs[lastIndex];
        urlConfs.length = lastIndex;
        return { weight, conf };
    }
    loadNextUrl(delay = 0) {
        const ret = this.getNextUrl();
        if (!ret) {
            if (this.urlLoaderSet.size === 0) {
                const err = new FileLoaderError('failed to load: ' + this.getFileConfUrl());
                err.urlErrs = this.urlErrs;
                this.onError(err);
            }
            return;
        }
        const { weight, conf } = ret;
        if (weight < 0 && delay > 0) {
            // 并行加载多个备用 URL 时，推迟低权重的站点（例如当前站点、收费站点）
            this.delayTid = setTimeout(() => {
                this.delayTid = 0;
                this.createUrlLoader(conf);
            }, delay);
            return;
        }
        this.createUrlLoader(conf);
    }
    getFileConfUrl() {
        return this.fileConf.name + this.suffix;
    }
    getBackupUrl(url) {
        if (url.endsWith('/')) {
            return url + this.suffix;
        }
        return url;
    }
    createUrlLoader(urlConf) {
        const url = this.getBackupUrl(urlConf.url);
        const mods = urlConf.parse(this.manifest);
        const urlLoader = new UrlLoader(url, mods);
        this.urlLoaderSet.add(urlLoader);
        urlLoader.onData = (chunk) => {
            if (this.closed) {
                return;
            }
            const add = urlLoader.bytesRead - this.bytesRead;
            if (add <= 0) {
                // 当前节点的进度落后于总进度，丢弃收到的数据
                return;
            }
            if (add !== chunk.length) {
                chunk = chunk.subarray(-add);
            }
            this.bytesRead = urlLoader.bytesRead;
            if (this.rangeEnd) {
                const exceed = this.bytesRead - this.rangeEnd;
                if (exceed > 0) {
                    chunk = chunk.subarray(0, -exceed);
                    this.onData(chunk);
                    urlLoader.onEnd();
                    return;
                }
            }
            this.onData(chunk);
        };
        urlLoader.onEnd = () => {
            if (this.closed) {
                return;
            }
            this.closed = true;
            this.onEnd();
            this.abort('TASK_DONE');
        };
        urlLoader.onError = (err) => {
            this.urlErrs.push({ url: urlLoader.url, err });
            this.urlLoaderSet.delete(urlLoader);
            this.loadNextUrl();
        };
        urlLoader.onResponse = (resArgs) => {
            if (this.opened) {
                return;
            }
            if (this.hasRange) {
                this.buildResRange(resArgs);
            }
            this.opened = true;
            this.onOpen(resArgs);
        };
        urlLoader.request(this);
    }
}
const EMPTY_PARAMS = new Map();
class Updater {
    constructor(manifestPath, onAvailable) {
        this.onAvailable = onAvailable;
        this.urlWsMap = new Map();
        this.wsArgs = '';
        this.updating = false;
        this.manifestHash = EMPTY_BUF;
        this.pollingTimer = 0;
        this.pollingInterval = 300000 /* DEFAULT_INTERVAL */;
        this.lastTime = 0;
        this.setSvcTimer = 0;
        this.backupUrls = [];
        const url = new URL(manifestPath, MY_URL);
        console.assert(url.host === MY_HOST);
        const path = url.pathname + url.search;
        if (path !== DEFAULT_MANIFEST_PATH) {
            this.wsArgs = '?manifest=' + encodeURIComponent(path);
        }
        this.manifestUrl = path;
    }
    async getManifestFromCache() {
        const res = await CacheManager.findCache(this.manifestUrl);
        if (!res) {
            return;
        }
        const buf = await res.arrayBuffer();
        const bin = new Uint8Array(buf);
        // 使用公钥校验缓存配置（缓存可被恶意脚本篡改）
        if (!await KeyManager.verify(bin)) {
            return;
        }
        const txt = bytesToUtf8(bin);
        const manifest = new Manifest();
        await manifest.parse(txt);
        return manifest;
    }
    async init() {
        const manifest = await this.getManifestFromCache();
        if (manifest) {
            // 先使用本地缓存的配置
            this.onAvailable(manifest);
        }
        await this.update();
    }
    async update() {
        if (this.updating) {
            return true;
        }
        const now = Date.now();
        if (now - this.lastTime < 1000 /* MIN_INTERVAL */) {
            return true;
        }
        this.lastTime = now;
        this.updating = true;
        try {
            return await this.updateUnsafe();
        }
        catch (err) {
            console.error('[FreeCDN/Updater] update err:', err);
            return false;
        }
        finally {
            this.updating = false;
        }
    }
    async updateUnsafe() {
        // from current site
        const data = await this.fetchManifest(this.manifestUrl);
        if (data) {
            await this.applyManifest(data);
            return true;
        }
        console.warn('[FreeCDN/Updater] failed to fetch 1st manifest:', this.manifestUrl);
        if (this.backupUrls.length === 0) {
            console.warn('[FreeCDN/Updater] no backup url');
            return false;
        }
        // from backup sites
        for (const url of this.backupUrls) {
            const data = await this.fetchManifest(url);
            if (!data) {
                console.warn('[FreeCDN/Updater] failed to fetch 3rd manifest:', url);
                continue;
            }
            if (!await KeyManager.verify(data)) {
                console.warn('[FreeCDN/Updater] failed to verify 3rd manifest:', url);
                continue;
            }
            await this.applyManifest(data);
            return true;
        }
        console.warn('[FreeCDN/Updater] failed to reload');
        return false;
    }
    async fetchManifest(url) {
        const ctl = new AbortController();
        const tid = setTimeout(() => {
            ctl.abort();
        }, 3000 /* FETCH_TIMEOUT */);
        const req = new Request(url, {
            // https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
            cache: 'no-cache',
            signal: ctl.signal,
        });
        try {
            const res = await Network.fetch(req);
            const bin = await res.arrayBuffer();
            return new Uint8Array(bin);
        }
        catch {
        }
        finally {
            clearTimeout(tid);
        }
    }
    async applyManifest(bytes) {
        const hash = await sha256(bytes);
        if (isArrayEqual(this.manifestHash, hash)) {
            return;
        }
        this.manifestHash = hash;
        // 缓存最新的清单内容
        const res = new Response(bytes);
        res.headers.set('content-length', bytes.length + '');
        CacheManager.addCache(this.manifestUrl, res);
        const manifest = new Manifest();
        const txt = bytesToUtf8(bytes);
        await manifest.parse(txt);
        this.onAvailable(manifest);
    }
    applyConfs(params) {
        this.backupUrls = this.parseBackupParam(params);
        const interval = this.parseIntervalParam(params);
        this.setPollingInterval(interval);
        const svcUrls = this.parseServicesParam(params);
        if (this.setSvcTimer > 0) {
            clearTimeout(this.setSvcTimer);
        }
        // 延时开启，减少对业务的性能影响
        this.setSvcTimer = setTimeout(() => {
            this.setSvcTimer = 0;
            this.setServices(svcUrls);
        }, 5000 /* SET_SVC_DELAY */);
    }
    parseBackupParam(params) {
        const str = params.get('backup') || '';
        return splitList(str);
    }
    parseIntervalParam(params) {
        const str = params.get('interval');
        if (str) {
            const num = parseTime(str);
            if (!isNaN(num)) {
                return num;
            }
            console.warn('[FreeCDN/Updater] invalid interval:', str);
        }
        return 300000 /* DEFAULT_INTERVAL */;
    }
    parseServicesParam(params) {
        const str = params.get('services') || '';
        return splitList(str);
    }
    setPollingInterval(interval) {
        if (this.pollingInterval === interval) {
            return;
        }
        this.pollingInterval === interval;
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
        }
        if (interval > 0) {
            this.pollingTimer = setInterval(() => {
                this.update();
            }, interval);
        }
    }
    setServices(urls) {
        for (const [url, ws] of this.urlWsMap) {
            if (!urls.includes(url)) {
                ws.onclose = null;
                ws.close();
                this.urlWsMap.delete(url);
            }
        }
        for (const url of urls) {
            if (!this.urlWsMap.has(url)) {
                this.createSvc(url);
            }
        }
    }
    createSvc(url) {
        const ws = new WebSocket(url + this.wsArgs);
        ws.binaryType = 'arraybuffer';
        ws.onmessage = (e) => {
            const hashBin = new Uint8Array(e.data);
            if (isArrayEqual(this.manifestHash, hashBin)) {
                return;
            }
            this.update();
        };
        ws.onclose = () => {
            this.urlWsMap.delete(url);
            setTimeout(() => {
                this.createSvc(url);
            }, 20000 /* WS_RETRY_DELAY */);
        };
        this.urlWsMap.set(url, ws);
    }
}
///<reference path="global.ts"/>
///<reference path="param-base.ts"/>
///<reference path="key-manager.ts"/>
///<reference path="manifest.ts"/>
///<reference path="url-conf.ts"/>
///<reference path="url-loader.ts"/>
///<reference path="file-conf.ts"/>
///<reference path="file-loader.ts"/>
///<reference path="updater.ts"/>
class FreeCDN {
    constructor(manifestUrl) {
        this.enableCacheStorage = true;
        this.weightConf = new Map();
        this.inited = false;
        if (!manifestUrl) {
            return;
        }
        const updater = new Updater(manifestUrl, manifest => {
            this.manifest = manifest;
            const updateConf = manifest.getParams('@update') || EMPTY_PARAMS;
            updater.applyConfs(updateConf);
            // 权重参数
            this.weightConf = Network.parseWeightConf(manifest);
        });
        this.updater = updater;
    }
    async fetch(input, init) {
        const req = (input instanceof Request && !init)
            ? input
            : new Request(input, init);
        if (!/^https?:/.test(req.url)) {
            return NATIVE_FETCH(req);
        }
        const { manifest } = this;
        if (!manifest) {
            return Network.fetch(req);
        }
        let fileConf;
        let suffix = '';
        FIND: for (;;) {
            const urlObj = new URL(req.url);
            // 同源 URL 使用相对路径，不同源使用完整路径（和清单中格式保持一致）
            const prefix = urlObj.origin === MY_ORIGIN ? '' : urlObj.origin;
            // 带参数的 URL 尝试完整匹配
            if (urlObj.search) {
                fileConf = manifest.get(prefix + urlObj.pathname + urlObj.search);
                if (fileConf) {
                    break;
                }
            }
            // 合并路径中连续的 `/`
            const path = urlObj.pathname.replace(/\/{2,}/g, '/');
            const file = prefix + path;
            // 优先使用 avif、webp 版本
            if (REG_IMG_EXTS.test(file) && req.mode !== 'cors' && !req.integrity) {
                const accept = req.headers.get('accept') || '';
                if (accept.includes('image/avif')) {
                    fileConf = manifest.get(file + '.avif');
                    if (fileConf) {
                        break;
                    }
                }
                if (accept.includes('image/webp')) {
                    fileConf = manifest.get(file + '.webp');
                    if (fileConf) {
                        break;
                    }
                }
            }
            fileConf = manifest.get(file);
            if (fileConf) {
                break;
            }
            if (file.endsWith('/')) {
                fileConf = manifest.get(file + 'index.html');
                if (fileConf) {
                    break;
                }
            }
            // 重定向到 `/` 结尾的路径
            if (manifest.has(file + '/index.html')) {
                return Response.redirect(file + '/');
            }
            // 目录匹配
            // 尾部保存到 suffix 变量。例如访问 /path/to/file?a=1
            // 清单若存在 /path/ 文件，suffix 则为 `to/file?a=1`
            // 删除末尾的文件名。保持 `/` 结尾
            let dir = path.replace(/[^/]*$/, '');
            for (;;) {
                fileConf = manifest.get(prefix + dir);
                if (fileConf) {
                    suffix = path.substring(dir.length) + urlObj.search;
                    break FIND;
                }
                if (dir === '/') {
                    break;
                }
                // 删除末尾的目录名。保持 `/` 结尾
                dir = dir.replace(/[^/]+\/$/, '');
            }
            // 清单中无匹配，直接转发
            return Network.fetch(req);
        }
        fileConf.parse();
        let fileHash = '';
        const hashParam = fileConf.params.get('hash');
        if (hashParam && hashParam.length === 44 /* SHA256_B64 */) {
            fileHash = hashParam;
        }
        const range = req.headers.get('range');
        const cacheable = this.enableCacheStorage && fileHash && !range;
        if (cacheable) {
            const res = await CacheManager.findHash(fileHash);
            if (res) {
                return res;
            }
        }
        const fileLoader = new FileLoader(fileConf, req, manifest, this.weightConf, range, suffix);
        const promise = promisex();
        // 如果文件只有一个 hash 则不用流模式（必须完整下载才能校验 hash）
        if (fileHash) {
            fileLoader.onOpen = (args) => {
                fileLoader.onData = (body) => {
                    const res = new Response(body, args);
                    if (cacheable && body.length < 1024 * 1024 * 5) {
                        const cacheRes = res.clone();
                        // 字段可在控制台列表中显示，方便调试
                        cacheRes.headers.set('content-length', body.length + '');
                        cacheRes.headers.set('x-raw-url', req.url);
                        CacheManager.addHash(fileHash, cacheRes);
                    }
                    promise.resolve(res);
                };
            };
            fileLoader.onError = (err) => {
                console.warn('[FreeCDN]', err.message, err.urlErrs);
                promise.reject(err);
            };
            fileLoader.onEnd = () => {
            };
            fileLoader.open();
            return promise;
        }
        // 如果文件有多个 hash 或没有 hash，可使用流模式
        let controller;
        let paused = false;
        const checkPressure = () => {
            const { desiredSize } = controller;
            if (desiredSize === null) {
                return;
            }
            if (desiredSize <= 0) {
                if (!paused) {
                    fileLoader.pause();
                    paused = true;
                }
            }
            else {
                if (paused) {
                    fileLoader.resume();
                    paused = false;
                }
            }
        };
        const stream = new ReadableStream({
            start(c) {
                controller = c;
            },
            pull() {
                checkPressure();
            },
            cancel(reason) {
                console.warn('[FreeCDN] stream cancel:', reason);
                fileLoader.abort(reason);
            },
        });
        fileLoader.onData = (chunk) => {
            controller.enqueue(chunk);
            checkPressure();
        };
        fileLoader.onEnd = () => {
            controller.close();
        };
        fileLoader.onError = (err) => {
            controller.error();
            console.warn('[FreeCDN]', err.message, err.urlErrs);
            promise.reject(err);
        };
        fileLoader.onOpen = (args) => {
            const res = new Response(stream, args);
            promise.resolve(res);
        };
        fileLoader.open();
        return promise;
    }
    async fetchText(url) {
        const res = await this.fetch(url);
        return res.text();
    }
    async fetchBin(url) {
        const res = await this.fetch(url);
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
    }
    async fetchBlob(url) {
        const res = await this.fetch(url);
        const buf = await res.arrayBuffer();
        const type = res.headers.get('content-type') || '';
        return new Blob([buf], { type });
    }
    async update() {
        if (this.updater) {
            return this.updater.update();
        }
        return false;
    }
    async setPublicKey(keyB64) {
        if (keyB64.length !== 124 /* PUBKEY_B64 */) {
            keyB64 = `MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE${keyB64}==`;
        }
        await KeyManager.set(keyB64);
    }
    async init() {
        console.assert(!this.inited);
        this.inited = true;
        await globalInit();
        if (this.updater) {
            await this.updater.init();
        }
    }
}
// non-callback style Promise
function promisex() {
    let resolve;
    let reject;
    const p = new Promise((a, b) => {
        resolve = a;
        reject = b;
    });
    // @ts-ignore
    p.resolve = resolve;
    // @ts-ignore
    p.reject = reject;
    return p;
}
// faster than instanceof
function isPromise(obj) {
    return typeof obj.then === 'function';
}
///<reference path="../../core-lib/src/freecdn.ts"/>
///<reference path="../../core-lib/src/promisex.ts"/>
///<reference path="hook.ts"/>
var Sw;
(function (Sw) {
    const GLOBAL = self;
    const mLoaderJsRes = new Response('/* freecdn is installed */', {
        headers: {
            'content-type': 'text/javascript',
            'cache-control': 'max-age=3600',
        },
    });
    let mFreeCDN;
    let mIniting;
    let mResUrlMap;
    // 共享模式（脚本通过业务方的 SW 引入）
    function sharedModeInit() {
        Hook.func(GLOBAL, 'fetch', oldFn => sharedModeHandler);
        Hook.func(Cache.prototype, 'add', oldFn => async function (req) {
            const res = await sharedModeHandler(req);
            await this.put(req, res);
        });
        Hook.func(Cache.prototype, 'addAll', oldFn => async function (reqs) {
            const tasks = reqs.map(req => this.add(req));
            await Promise.all(tasks);
        });
        mResUrlMap = new WeakMap();
        // 由于自定义的 Response 对象 url 为空，因此通过 hook 的方式保留原始 url
        Hook.prop(Response.prototype, 'url', getter => function () {
            return mResUrlMap.get(this) || getter.call(this);
        }, 
        /* setter */ null);
        Hook.func(Response.prototype, 'clone', oldFn => function () {
            const res = oldFn.call(this);
            const url = mResUrlMap.get(this);
            if (url) {
                mResUrlMap.set(res, url);
            }
            return res;
        });
    }
    async function sharedModeHandler(input, init) {
        if (mIniting) {
            // freecdn 仍在初始化中（例如加载清单文件）
            await mIniting;
        }
        const req = (input instanceof Request && !init)
            ? input
            : new Request(input, init);
        const res = await mFreeCDN.fetch(req);
        mResUrlMap.set(res, req.url);
        return res;
    }
    // 独占模式（通过 freecdn-loader.min.js 引入）
    function loaderModeInit() {
        // 重写 Q.push，这样 loader-js 可直接传递 event 和 promise
        Q.push = loaderModeHandler;
        while (Q.length) {
            const args = Q.splice(0, 3);
            loaderModeHandler(...args);
        }
    }
    function loaderModeHandler(e, resolve, reject) {
        const req = e.request;
        // debug
        if (req.url.endsWith('/freecdn-update')) {
            mFreeCDN.update().then(result => {
                const res = new Response('updated. success: ' + result, {
                    headers: {
                        'content-type': 'text/html',
                    },
                });
                resolve(res);
            });
            return;
        }
        if (req.url === MY_URL) {
            resolve(mLoaderJsRes.clone());
            return;
        }
        mFreeCDN.fetch(req).then(resolve, reject);
    }
    async function main() {
        mFreeCDN = new FreeCDN('freecdn-manifest.txt');
        const isSharedMode = !!GLOBAL.FREECDN_SHARED_MODE;
        let publicKey;
        if (isSharedMode) {
            mFreeCDN.enableCacheStorage = false;
            mIniting = promisex();
            // 在此之前不要使用 await，否则安装 hook 会被推迟，导致初始化时无法触发 hook
            sharedModeInit();
            publicKey = GLOBAL.FREECDN_PUBLIC_KEY;
        }
        else {
            publicKey = Q.shift();
        }
        if (publicKey) {
            await mFreeCDN.setPublicKey(publicKey);
        }
        await mFreeCDN.init();
        if (isSharedMode) {
            mIniting?.resolve();
            mIniting = null;
        }
        else {
            loaderModeInit();
        }
        console.log('[FreeCDN] service worker inited');
    }
    main();
})(Sw || (Sw = {}));
class ParamBr extends ParamBase {
    constructor() {
        super();
        this.state = 0;
    }
    static async init() {
        if (this.signal) {
            return;
        }
        this.signal = promisex();
        const BR_WASM_PATH = `${INTERNAL_PATH}/br/br.wasm`;
        const BR_GLUE_PATH = `${INTERNAL_PATH}/br/` + (IS_DEBUG ? 'br.js' : 'br.min.js');
        const BR_MANIFEST = IS_DEBUG ? '' : `
${BR_WASM_PATH}
	https://cdn.jsdelivr.net/npm/freecdn-js@${VER}/dist/br/br.wasm
	https://unpkg.com/freecdn-js@${VER}/dist/br/br.wasm
	https://code.bdstatic.com/npm/freecdn-js@${VER}/dist/br/br.wasm
	https://npm.elemecdn.com/freecdn-js@${VER}/dist/br/br.wasm
	hash=${BR_WASM_HASH}

${BR_GLUE_PATH}
	https://cdn.jsdelivr.net/npm/freecdn-js@${VER}/dist/br/br.min.js
	https://unpkg.com/freecdn-js@${VER}/dist/br/br.min.js
	https://code.bdstatic.com/npm/freecdn-js@${VER}/dist/br/br.min.js
	https://npm.elemecdn.com/freecdn-js@${VER}/dist/br/br.min.js
	hash=${BR_GLUE_HASH}
`;
        const onError = () => {
            this.hasErr = true;
            this.signal?.resolve();
        };
        const timer = setTimeout(onError, 20000 /* WASM_LOAD_TIMEOUT */);
        const asmMod = {
            locateFile: () => BR_WASM_PATH,
            onRuntimeInitialized: () => {
                this.inPtr = asmMod._AllocInBuf(131072 /* IN_BUF_LEN */);
                this.outPtr = asmMod._AllocOutBuf(524288 /* OUT_BUF_LEN */);
                clearTimeout(timer);
                this.signal?.resolve();
                this.signal = undefined;
            },
            onAbort: (reason) => {
                console.warn('[FreeCDN/Br] wasm onAbort:', reason);
                onError();
            },
            print: (msg) => {
                console.warn('[FreeCDN/Br] wasm print:', msg);
            },
            printErr: (err) => {
                console.warn('[FreeCDN/Br] wasm printErr:', err);
            },
        };
        const manifest = new Manifest();
        await manifest.parse(BR_MANIFEST);
        const cdn = new FreeCDN();
        cdn.manifest = manifest;
        const onFetch = async (...args) => {
            try {
                return await cdn.fetch(...args);
            }
            catch (err) {
                console.warn('[FreeCDN/Br] failed to load wasm');
                onError();
                throw err;
            }
        };
        try {
            const js = await cdn.fetchText(BR_GLUE_PATH);
            const fn = Function('Module', 'fetch', js);
            fn(asmMod, onFetch);
        }
        catch {
            console.warn('[FreeCDN/Br] failed to execute glue js');
            onError();
            return;
        }
        this.asmMod = asmMod;
    }
    static parseConf(conf) {
        if (conf === 'off') {
            return;
        }
        if (conf === 'on') {
            if (!this.asmMod) {
                this.init();
            }
            return [];
        }
        return 'invalid value';
    }
    async onData(chunk) {
        if (ParamBr.signal) {
            await this.waitWasm();
        }
        return this.process(chunk);
    }
    async onEnd(chunk) {
        if (ParamBr.signal) {
            await this.waitWasm();
        }
        // ???
        let buf = EMPTY_BUF;
        if (chunk.length > 0) {
            buf = this.process(chunk);
        }
        this.destory();
        return buf;
    }
    async waitWasm() {
        await ParamBr.signal;
        if (ParamBr.hasErr) {
            throw new ParamError('failed to load br decoder');
        }
    }
    process(chunk) {
        const asmObj = ParamBr.asmMod;
        const HEAPU8 = asmObj.HEAPU8;
        if (this.state === 0) {
            this.state = asmObj._Init();
        }
        const outBufs = [];
        for (let p = 0; p < chunk.length; p += 131072 /* IN_BUF_LEN */) {
            const inBuf = chunk.subarray(p, p + 131072 /* IN_BUF_LEN */);
            HEAPU8.set(inBuf, ParamBr.inPtr);
            let avaiablelIn = inBuf.length;
            let availableOut = 0;
            do {
                const ret = asmObj._Update(this.state, 0, avaiablelIn);
                if (ret === 0 /* ERROR */) {
                    const err = asmObj._GetErrorCode();
                    this.destory();
                    throw new ParamError('br decode failed. code: ' + err);
                }
                avaiablelIn = asmObj._GetAvailableIn();
                availableOut = asmObj._GetAvailableOut();
                const len = 524288 /* OUT_BUF_LEN */ - availableOut;
                if (len === 0) {
                    continue;
                }
                // use slice (copy), not subarray (ref)
                const outBuf = HEAPU8.slice(ParamBr.outPtr, ParamBr.outPtr + len);
                outBufs.push(outBuf);
            } while (asmObj._HasMoreOutput(this.state));
        }
        if (outBufs.length === 1) {
            return outBufs[0];
        }
        return concatBufs(outBufs);
    }
    destory() {
        ParamBr.asmMod._Destroy(this.state);
    }
}
ParamBr.hasErr = false;
class ParamBundle extends ParamBase {
    constructor(packUrl) {
        super();
        this.packUrl = packUrl;
    }
    static parseConf(conf) {
        if (conf === 'off') {
            return;
        }
        if (!/^https?:|^\//.test(conf)) {
            return 'invalid url';
        }
        return [conf];
    }
    async onRequest(reqArgs, fileLoader) {
        let fileMap;
        const r = ParamBundle.cacheMap.get(this.packUrl);
        if (r === undefined) {
            const map = await this.loadPkg(fileLoader.manifest);
            if (!map) {
                return;
            }
            fileMap = map;
        }
        else if (isPromise(r)) {
            fileMap = await r;
        }
        else {
            fileMap = r;
        }
        const path = fileLoader.suffix;
        const res = fileMap.get(path);
        if (res) {
            return res.clone();
        }
        if (path === '') {
            const res = fileMap.get('index.html');
            if (res) {
                fileLoader.suffix = 'index.html';
                return res.clone();
            }
        }
        if (path.endsWith('/')) {
            const res = fileMap.get(path + 'index.html');
            if (res) {
                fileLoader.suffix = path + 'index.html';
                return res.clone();
            }
        }
        if (fileMap.has(path + '/index.html')) {
            fileLoader.suffix = path + '/index.html';
            const redir = fileLoader.fileConf.name + path + '/';
            return new Response(`<meta http-equiv="Refresh" content="0;url=${redir}">`);
        }
    }
    async loadPkg(manifest) {
        const fileMap = new Map();
        const signal = promisex();
        ParamBundle.cacheMap.set(this.packUrl, signal);
        // TODO: support stream
        let pkgBin;
        try {
            if (manifest.has(this.packUrl)) {
                const cdn = new FreeCDN();
                cdn.manifest = manifest;
                pkgBin = await cdn.fetchBin(this.packUrl);
            }
            else {
                // 资源包不在清单中，或不是普通文件（例如是目录），则直接加载，防止循环依赖
                const res = await NATIVE_FETCH(this.packUrl);
                const buf = await res.arrayBuffer();
                pkgBin = new Uint8Array(buf);
            }
        }
        catch {
            this.warn('failed to load');
            return;
        }
        const pos = pkgBin.indexOf(13 /* '\r' */);
        if (pos === -1) {
            this.warn('missing header');
            return;
        }
        const confBin = pkgBin.subarray(0, pos);
        const confMap = parseJson(bytesToUtf8(confBin));
        if (!confMap) {
            this.warn('invalid header');
            return;
        }
        const bodyBin = pkgBin.subarray(pos + 1);
        let offset = 0;
        for (const [file, conf] of Object.entries(confMap)) {
            const len = +conf['content-length'];
            if (!(len >= 0)) {
                this.warn('invalid content-length');
                return;
            }
            if (offset + len > bodyBin.length) {
                this.warn('invalid offset');
                return;
            }
            const fileBuf = bodyBin.subarray(offset, offset + len);
            const res = new Response(fileBuf, {
                headers: confMap[file]
            });
            fileMap.set(file, res);
            offset += len;
        }
        ParamBundle.cacheMap.set(this.packUrl, fileMap);
        signal.resolve(fileMap);
        return fileMap;
    }
    warn(msg) {
        console.warn('[FreeCDN/Bundle]', msg, this.packUrl);
    }
}
ParamBundle.cacheMap = new Map();
const REG_TEXT_MIME = /^text\/|^application\/(?:javascript|json)|\+xml$/;
class ParamCharset extends ParamBase {
    constructor(charset) {
        super();
        this.charset = charset;
    }
    static parseConf(conf) {
        if (conf !== 'off') {
            return [conf];
        }
    }
    onResponse(resArgs) {
        const type = resArgs.headers.get('content-type') || '';
        if (REG_TEXT_MIME.test(type)) {
            resArgs.headers.set('content-type', type + '; charset=' + this.charset);
        }
    }
}
ParamCharset.reuse = true;
class ParamData extends ParamBase {
    constructor(bytes) {
        super();
        this.bytes = bytes;
    }
    static parseConf(conf) {
        const bytes = parseStrOrB64(conf);
        if (!bytes) {
            return 'invalid format';
        }
        return [bytes];
    }
    onRequest() {
        return new Response(this.bytes);
    }
}
ParamData.reuse = true;
class ParamExpires extends ParamBase {
    constructor(seconds) {
        super();
        this.seconds = seconds;
    }
    static parseConf(conf) {
        const time = parseTime(conf);
        if (isNaN(time)) {
            return 'invalid time format';
        }
        const seconds = time / 1000 | 0;
        return [seconds];
    }
    onResponse(resArgs, fileLoader, rawRes) {
        // 过期时间不小于实际值，防止经常变化的资源无法及时更新
        const rawMaxAge = rawRes._maxage;
        const maxAge = rawMaxAge < this.seconds ? rawMaxAge : this.seconds;
        resArgs.headers.append('cache-control', 'max-age=' + maxAge);
    }
}
ParamExpires.reuse = true;
class ParamHash extends ParamBase {
    constructor(blkLen, hashBins) {
        super();
        this.blkLen = blkLen;
        this.hashBins = hashBins;
        this.queueArr = [];
        this.queueLen = 0;
        this.hasData = false;
    }
    static parseConf(conf) {
        // conf format:
        // [blksize;]hash1,hash2,...
        let blkLen = 1e9;
        let hashes = conf;
        const pos = conf.indexOf(';');
        if (pos > 0) {
            const blkLenStr = conf.substring(0, pos);
            hashes = conf.substring(pos + 1);
            blkLen = parseByteUnit(blkLenStr);
            if (isNaN(blkLen)) {
                return 'invalid block length';
            }
        }
        const hashBins = [];
        const hashB64s = hashes.split(',');
        // 倒序存储，之后 pop 取出
        for (let i = hashB64s.length - 1; i !== -1; i--) {
            const bin = base64Decode(hashB64s[i]);
            if (!bin || bin.length !== 32 /* SHA256_BIN */) {
                return 'invalid block hash';
            }
            hashBins.push(bin);
        }
        return [blkLen, hashBins];
    }
    async onData(chunk) {
        this.hasData = true;
        this.queueLen += chunk.length;
        if (this.queueLen > 67108864 /* MAX_QUEUE_LEN */) {
            throw new ParamError('max queue length exceeded');
        }
        if (this.queueLen >= this.blkLen) {
            // let queueLen be integer multiple of blkLen
            const remain = this.queueLen % this.blkLen;
            if (remain) {
                const head = chunk.subarray(0, -remain);
                this.queueArr.push(head);
                this.queueLen -= remain;
            }
            else {
                this.queueArr.push(chunk);
            }
            const blks = await this.pull();
            this.queueLen = remain;
            if (remain) {
                const tail = chunk.subarray(-remain);
                this.queueArr.push(tail);
            }
            return blks;
        }
        this.queueArr.push(chunk);
        return EMPTY_BUF;
    }
    async onEnd(chunk) {
        if (chunk.length > 0) {
            this.queueLen += chunk.length;
            this.queueArr.push(chunk);
        }
        if (this.queueLen === 0) {
            if (!this.hasData) {
                await this.verify(EMPTY_BUF);
            }
            return EMPTY_BUF;
        }
        return this.pull();
    }
    async pull() {
        const blks = concatBufs(this.queueArr, this.queueLen);
        this.queueArr.length = 0;
        for (let p = 0; p < blks.length; p += this.blkLen) {
            const blk = blks.subarray(p, p + this.blkLen);
            await this.verify(blk);
        }
        return blks;
    }
    async verify(blk) {
        const hashExp = this.hashBins.pop();
        if (!hashExp) {
            throw new ParamError('missing hash');
        }
        const hashGot = await sha256(blk);
        if (!isArrayEqual(hashExp, hashGot)) {
            const exp = base64Encode(hashExp);
            const got = base64Encode(hashGot);
            throw new ParamError(`hash incorrect. expected: ${exp}, but got: ${got}`);
        }
    }
}
class ParamHeaders extends ParamBase {
    constructor(headers, preserveAll) {
        super();
        this.headers = headers;
        this.preserveAll = preserveAll;
    }
    static parseConf(conf) {
        return ParamReqHeaders.parse(conf);
    }
    onResponse(resArgs, fileLoader, rawRes) {
        if (this.preserveAll) {
            for (const [k, v] of rawRes.headers) {
                resArgs.headers.set(k, v);
            }
            for (const [k, v] of this.headers) {
                resArgs.headers.set(k, v);
            }
            return;
        }
        for (const [k, v] of this.headers) {
            if (v === '') {
                // preserve
                const rawVal = rawRes.headers.get(k);
                if (rawVal !== null) {
                    resArgs.headers.set(k, rawVal);
                }
            }
            else {
                // add
                resArgs.headers.set(k, v);
            }
        }
    }
}
ParamHeaders.reuse = true;
class ParamOpenTimeout extends ParamBase {
    constructor(time) {
        super();
        this.time = time;
        this.tid = 0;
    }
    static parseConf(conf) {
        const time = parseTime(conf);
        if (isNaN(time)) {
            return 'invalid time format';
        }
        return [time];
    }
    onRequest(reqArgs, fileLoader) {
        this.tid = setTimeout(() => {
            const delay = Math.max(this.time, 5000);
            fileLoader.loadNextUrl(delay);
        }, this.time);
    }
    onResponse() {
        this.stopTimer();
    }
    onError() {
        this.stopTimer();
    }
    onAbort() {
        this.stopTimer();
    }
    stopTimer() {
        if (this.tid > 0) {
            clearTimeout(this.tid);
            this.tid = 0;
        }
    }
}
class ParamPos extends ParamBase {
    constructor(pos) {
        super();
        this.remain = pos;
    }
    static parseConf(conf) {
        const begin = parseByteUnit(conf);
        if (isNaN(begin)) {
            return 'invalid byte format';
        }
        if (begin === 0) {
            return;
        }
        return [begin];
    }
    onData(chunk) {
        if (this.remain <= 0) {
            return chunk;
        }
        const remain = (this.remain -= chunk.length);
        if (remain >= 0) {
            return EMPTY_BUF;
        }
        // if remain < 0, return last -remain bytes
        return chunk.subarray(remain);
    }
    onEnd(chunk) {
        return this.onData(chunk);
    }
}
class ParamPrefix extends ParamBase {
    constructor(bytes) {
        super();
        this.bytes = bytes;
        this.done = false;
    }
    static parseConf(conf) {
        const bytes = parseStrOrB64(conf);
        if (!bytes) {
            return 'invalid format';
        }
        return [bytes];
    }
    onData(chunk) {
        if (this.done) {
            return chunk;
        }
        this.done = true;
        return concatBufs([this.bytes, chunk]);
    }
    onEnd(chunk) {
        // for empty file
        return this.onData(chunk);
    }
}
class ParamRecvTimeout extends ParamBase {
    constructor(bytes, time) {
        super();
        this.bytes = bytes;
        this.time = time;
        this.tid = 0;
        this.sum = 0;
    }
    static parseConf(conf) {
        const [n, t] = conf.split('/');
        const bytes = parseByteUnit(n);
        const time = parseTime(t);
        if (isNaN(bytes)) {
            return 'invalid byte format';
        }
        if (isNaN(time)) {
            return 'invalid time format';
        }
        return [bytes, time];
    }
    onRequest(reqArgs, fileLoader) {
        this.fileLoader = fileLoader;
    }
    onResponse() {
        this.tid = setInterval(() => {
            if (this.sum <= this.bytes) {
                this.stopTimer();
                this.fileLoader.loadNextUrl();
            }
            this.sum = 0;
        }, this.time);
    }
    onData(chunk) {
        this.sum += chunk.length;
        return chunk;
    }
    onEnd(chunk) {
        this.stopTimer();
        return chunk;
    }
    onError() {
        this.stopTimer();
    }
    onAbort() {
        this.stopTimer();
    }
    stopTimer() {
        if (this.tid > 0) {
            clearInterval(this.tid);
            this.tid = 0;
        }
    }
}
const REG_REFFERER_POLICY = /^(?:no-referrer|unsafe-url|origin|same-origin|strict-origin|no-referrer-when-downgrade|origin-when-cross-origin|strict-origin-when-cross-origin)$/;
class ParamReferrerPolicy extends ParamBase {
    constructor(policy) {
        super();
        this.policy = policy;
    }
    static parseConf(conf) {
        if (conf === 'raw') {
            return [''];
        }
        if (!REG_REFFERER_POLICY.test(conf)) {
            return 'invalid value';
        }
        return [conf];
    }
    onRequest(reqArgs, fileLoader) {
        reqArgs.referrerPolicy = this.policy || fileLoader.rawReq.referrerPolicy;
    }
}
ParamReferrerPolicy.reuse = true;
class ParamReqHeaders extends ParamBase {
    constructor(headers, preserveAll) {
        super();
        this.headers = headers;
        this.preserveAll = preserveAll;
    }
    static parse(conf) {
        const headers = [];
        let preserveAll = false;
        // {"header-to-preserve": "", "header-to-add": "val"}
        const map = parseJson(conf);
        if (typeof map !== 'object') {
            return 'invalid format';
        }
        for (const [k, v] of Object.entries(map)) {
            if (k === '*') {
                preserveAll = true;
            }
            else {
                headers.push([k, v + '']);
            }
        }
        return [headers, preserveAll];
    }
    static parseConf(conf) {
        return this.parse(conf);
    }
    onRequest(reqArgs, fileLoader) {
        const { rawReq } = fileLoader;
        if (this.preserveAll) {
            for (const [k, v] of rawReq.headers) {
                reqArgs.headers.set(k, v);
            }
            for (const [k, v] of this.headers) {
                reqArgs.headers.set(k, v);
            }
            return;
        }
        for (const [k, v] of this.headers) {
            if (k === 'referer') {
                reqArgs.referrer = v || rawReq.referrer;
                continue;
            }
            if (v === '') {
                // preserve
                const rawVal = rawReq.headers.get(k);
                if (rawVal !== null) {
                    reqArgs.headers.set(k, rawVal);
                }
            }
            else {
                // add
                reqArgs.headers.set(k, v);
            }
        }
    }
}
ParamReqHeaders.reuse = true;
class ParamSize extends ParamBase {
    constructor(size) {
        super();
        this.remain = size;
    }
    static parseConf(conf) {
        const size = parseByteUnit(conf);
        if (isNaN(size)) {
            return 'invalid byte format';
        }
        return [size];
    }
    onData(chunk) {
        if (this.remain <= 0) {
            return EMPTY_BUF;
        }
        const remain = (this.remain -= chunk.length);
        if (remain >= 0) {
            return chunk;
        }
        // remain < 0, return [0, END + remain)
        return chunk.subarray(0, remain);
    }
    onEnd(chunk) {
        return this.onData(chunk);
    }
}
class ParamStream extends ParamBase {
    constructor() {
        super();
        this.queueArr = [];
        this.queueLen = 0;
    }
    static parseConf(conf) {
        if (conf === 'on') {
            // default
            return;
        }
        if (conf === 'off') {
            return [];
        }
        return 'invalid value';
    }
    onData(chunk) {
        this.queueLen += chunk.length;
        if (this.queueLen > 67108864 /* MAX_QUEUE_LEN */) {
            throw new ParamError('max queue length exceeded');
        }
        this.queueArr.push(chunk);
        return EMPTY_BUF;
    }
    onEnd(chunk) {
        if (chunk.length > 0) {
            // unlikely
            this.onData(chunk);
        }
        return concatBufs(this.queueArr, this.queueLen);
    }
}
class ParamSuffix extends ParamBase {
    constructor(bytes) {
        super();
        this.bytes = bytes;
    }
    static parseConf(conf) {
        const bytes = parseStrOrB64(conf);
        if (!bytes) {
            return 'invalid format';
        }
        return [bytes];
    }
    onEnd(chunk) {
        if (chunk.length === 0) {
            return this.bytes;
        }
        return concatBufs([chunk, this.bytes]);
    }
}
ParamSuffix.reuse = true;
class ParamValidStatus extends ParamBase {
    constructor(codes) {
        super();
        this.codes = codes;
    }
    static parseConf(conf) {
        if (conf === '*') {
            return;
        }
        const codes = conf.split(',').map(Number);
        return [codes];
    }
    onResponse(resArgs, fileLoader, rawRes) {
        if (!this.codes.includes(rawRes.status)) {
            throw new ParamError('invalid http status: ' + rawRes.status);
        }
    }
}
ParamValidStatus.reuse = true;
class ParamXor extends ParamBase {
    constructor(key) {
        super();
        this.key = key;
    }
    static parseConf(conf) {
        const key = +conf | 0;
        if (key < 0 || key > 255) {
            return 'invalid value';
        }
        return [key];
    }
    onData(chunk) {
        // TODO: u32 optimize
        for (let i = 0; i < chunk.length; i++) {
            chunk[i] ^= this.key;
        }
        return chunk;
    }
    onEnd(chunk) {
        return this.onData(chunk);
    }
}
ParamXor.reuse = true;
const MIME_DATA = 'application/andrew-inset:ez;application/applixware:aw;application/atom+xml:atom;application/atomcat+xml:atomcat;application/atomdeleted+xml:atomdeleted;application/atomsvc+xml:atomsvc;application/atsc-dwd+xml:dwd;application/atsc-held+xml:held;application/atsc-rsat+xml:rsat;application/bdoc:bdoc;application/calendar+xml:xcs;application/ccxml+xml:ccxml;application/cdfx+xml:cdfx;application/cdmi-capability:cdmia;application/cdmi-container:cdmic;application/cdmi-domain:cdmid;application/cdmi-object:cdmio;application/cdmi-queue:cdmiq;application/cu-seeme:cu;application/dash+xml:mpd;application/davmount+xml:davmount;application/docbook+xml:dbk;application/dssc+der:dssc;application/dssc+xml:xdssc;application/ecmascript:ecma,es;application/emma+xml:emma;application/emotionml+xml:emotionml;application/epub+zip:epub;application/exi:exi;application/fdt+xml:fdt;application/font-tdpfr:pfr;application/geo+json:geojson;application/gml+xml:gml;application/gpx+xml:gpx;application/gxf:gxf;application/gzip:gz;application/hjson:hjson;application/hyperstudio:stk;application/inkml+xml:ink,inkml;application/ipfix:ipfix;application/its+xml:its;application/java-archive:jar,war,ear;application/java-serialized-object:ser;application/java-vm:class;application/javascript:js,mjs;application/json:json,map;application/json5:json5;application/jsonml+json:jsonml;application/ld+json:jsonld;application/lgr+xml:lgr;application/lost+xml:lostxml;application/mac-binhex40:hqx;application/mac-compactpro:cpt;application/mads+xml:mads;application/manifest+json:webmanifest;application/marc:mrc;application/marcxml+xml:mrcx;application/mathematica:ma,nb,mb;application/mathml+xml:mathml;application/mbox:mbox;application/mediaservercontrol+xml:mscml;application/metalink+xml:metalink;application/metalink4+xml:meta4;application/mets+xml:mets;application/mmt-aei+xml:maei;application/mmt-usd+xml:musd;application/mods+xml:mods;application/mp21:m21,mp21;application/mp4:mp4s,m4p;application/mrb-consumer+xml:xdf;application/mrb-publish+xml:xdf;application/msword:doc,dot;application/mxf:mxf;application/n-quads:nq;application/n-triples:nt;application/node:cjs;application/octet-stream:bin,dms,lrf,mar,so,dist,distz,pkg,bpk,dump,elc,deploy,exe,dll,deb,dmg,iso,img,msi,msp,msm,buffer;application/oda:oda;application/oebps-package+xml:opf;application/ogg:ogx;application/omdoc+xml:omdoc;application/onenote:onetoc,onetoc2,onetmp,onepkg;application/oxps:oxps;application/p2p-overlay+xml:relo;application/patch-ops-error+xml:xer;application/pdf:pdf;application/pgp-encrypted:pgp;application/pgp-signature:asc,sig;application/pics-rules:prf;application/pkcs10:p10;application/pkcs7-mime:p7m,p7c;application/pkcs7-signature:p7s;application/pkcs8:p8;application/pkix-attr-cert:ac;application/pkix-cert:cer;application/pkix-crl:crl;application/pkix-pkipath:pkipath;application/pkixcmp:pki;application/pls+xml:pls;application/postscript:ai,eps,ps;application/provenance+xml:provx;application/pskc+xml:pskcxml;application/raml+yaml:raml;application/rdf+xml:rdf,owl;application/reginfo+xml:rif;application/relax-ng-compact-syntax:rnc;application/resource-lists+xml:rl;application/resource-lists-diff+xml:rld;application/rls-services+xml:rs;application/route-apd+xml:rapd;application/route-s-tsid+xml:sls;application/route-usd+xml:rusd;application/rpki-ghostbusters:gbr;application/rpki-manifest:mft;application/rpki-roa:roa;application/rsd+xml:rsd;application/rss+xml:rss;application/rtf:rtf;application/sbml+xml:sbml;application/scvp-cv-request:scq;application/scvp-cv-response:scs;application/scvp-vp-request:spq;application/scvp-vp-response:spp;application/sdp:sdp;application/senml+xml:senmlx;application/sensml+xml:sensmlx;application/set-payment-initiation:setpay;application/set-registration-initiation:setreg;application/shf+xml:shf;application/sieve:siv,sieve;application/smil+xml:smi,smil;application/sparql-query:rq;application/sparql-results+xml:srx;application/srgs:gram;application/srgs+xml:grxml;application/sru+xml:sru;application/ssdl+xml:ssdl;application/ssml+xml:ssml;application/swid+xml:swidtag;application/tei+xml:tei,teicorpus;application/thraud+xml:tfi;application/timestamped-data:tsd;application/toml:toml;application/ttml+xml:ttml;application/ubjson:ubj;application/urc-ressheet+xml:rsheet;application/urc-targetdesc+xml:td;application/voicexml+xml:vxml;application/wasm:wasm;application/widget:wgt;application/winhlp:hlp;application/wsdl+xml:wsdl;application/wspolicy+xml:wspolicy;application/xaml+xml:xaml;application/xcap-att+xml:xav;application/xcap-caps+xml:xca;application/xcap-diff+xml:xdf;application/xcap-el+xml:xel;application/xcap-error+xml:xer;application/xcap-ns+xml:xns;application/xenc+xml:xenc;application/xhtml+xml:xhtml,xht;application/xliff+xml:xlf;application/xml:xml,xsl,xsd,rng;application/xml-dtd:dtd;application/xop+xml:xop;application/xproc+xml:xpl;application/xslt+xml:xsl,xslt;application/xspf+xml:xspf;application/xv+xml:mxml,xhvml,xvml,xvm;application/yang:yang;application/yin+xml:yin;application/zip:zip;audio/3gpp:3gpp;audio/adpcm:adp;audio/amr:amr;audio/basic:au,snd;audio/midi:mid,midi,kar,rmi;audio/mobile-xmf:mxmf;audio/mp3:mp3;audio/mp4:m4a,mp4a;audio/mpeg:mpga,mp2,mp2a,mp3,m2a,m3a;audio/ogg:oga,ogg,spx,opus;audio/s3m:s3m;audio/silk:sil;audio/wav:wav;audio/wave:wav;audio/webm:weba;audio/xm:xm;font/collection:ttc;font/otf:otf;font/ttf:ttf;font/woff:woff;font/woff2:woff2;image/aces:exr;image/apng:apng;image/avif:avif;image/bmp:bmp;image/cgm:cgm;image/dicom-rle:drle;image/emf:emf;image/fits:fits;image/g3fax:g3;image/gif:gif;image/heic:heic;image/heic-sequence:heics;image/heif:heif;image/heif-sequence:heifs;image/hej2k:hej2;image/hsj2:hsj2;image/ief:ief;image/jls:jls;image/jp2:jp2,jpg2;image/jpeg:jpeg,jpg,jpe;image/jph:jph;image/jphc:jhc;image/jpm:jpm;image/jpx:jpx,jpf;image/jxr:jxr;image/jxra:jxra;image/jxrs:jxrs;image/jxs:jxs;image/jxsc:jxsc;image/jxsi:jxsi;image/jxss:jxss;image/ktx:ktx;image/ktx2:ktx2;image/png:png;image/sgi:sgi;image/svg+xml:svg,svgz;image/t38:t38;image/tiff:tif,tiff;image/tiff-fx:tfx;image/webp:webp;image/wmf:wmf;message/disposition-notification:disposition-notification;message/global:u8msg;message/global-delivery-status:u8dsn;message/global-disposition-notification:u8mdn;message/global-headers:u8hdr;message/rfc822:eml,mime;model/3mf:3mf;model/gltf+json:gltf;model/gltf-binary:glb;model/iges:igs,iges;model/mesh:msh,mesh,silo;model/mtl:mtl;model/obj:obj;model/stl:stl;model/vrml:wrl,vrml;model/x3d+binary:x3db,x3dbz;model/x3d+fastinfoset:x3db;model/x3d+vrml:x3dv,x3dvz;model/x3d+xml:x3d,x3dz;model/x3d-vrml:x3dv;text/cache-manifest:appcache,manifest;text/calendar:ics,ifb;text/coffeescript:coffee,litcoffee;text/css:css;text/csv:csv;text/html:html,htm,shtml;text/jade:jade;text/jsx:jsx;text/less:less;text/markdown:markdown,md;text/mathml:mml;text/mdx:mdx;text/n3:n3;text/plain:txt,text,conf,def,list,log,in,ini;text/richtext:rtx;text/rtf:rtf;text/sgml:sgml,sgm;text/shex:shex;text/slim:slim,slm;text/spdx:spdx;text/stylus:stylus,styl;text/tab-separated-values:tsv;text/troff:t,tr,roff,man,me,ms;text/turtle:ttl;text/uri-list:uri,uris,urls;text/vcard:vcard;text/vtt:vtt;text/xml:xml;text/yaml:yaml,yml;video/3gpp:3gp,3gpp;video/3gpp2:3g2;video/h261:h261;video/h263:h263;video/h264:h264;video/iso.segment:m4s;video/jpeg:jpgv;video/jpm:jpm,jpgm;video/mj2:mj2,mjp2;video/mp2t:ts;video/mp4:mp4,mp4v,mpg4;video/mpeg:mpeg,mpg,mpe,m1v,m2v;video/ogg:ogv;video/quicktime:qt,mov;video/webm:webm';
var _a;
class ParamMime extends ParamBase {
    constructor(mime) {
        super();
        this.mime = mime;
    }
    static parseConf(conf) {
        if (conf === 'auto') {
            // likely
            return [''];
        }
        return [conf];
    }
    onResponse(resArgs, fileLoader, rawRes) {
        let type;
        if (this.mime === '') {
            const url = fileLoader.getFileConfUrl();
            if (!url.includes('?')) {
                const m = url.match(/\.(\w+)$/);
                if (m) {
                    const ext = m[1].toLowerCase();
                    type = ParamMime.extTypeMap.get(ext);
                }
            }
            if (!type) {
                const rawType = rawRes.headers.get('content-type');
                if (rawType) {
                    type = getPair(rawType, ';')[0];
                }
                else {
                    type = 'application/octet-stream';
                }
            }
        }
        else {
            type = this.mime;
        }
        resArgs.headers.set('content-type', type);
    }
}
_a = ParamMime;
ParamMime.reuse = true;
(() => {
    const map = new Map();
    for (const item of MIME_DATA.split(';')) {
        const [mime, exts] = getPair(item, ':');
        for (const ext of exts.split(',')) {
            map.set(ext, mime);
        }
    }
    _a.extTypeMap = map;
})();
var CacheManager;
(function (CacheManager) {
    let mCache;
    // TODO: LRU
    async function init() {
        if (!mCache) {
            mCache = await caches.open('.freecdn');
        }
    }
    CacheManager.init = init;
    async function findHash(hash) {
        const res = await findCache('/' + hash);
        if (!res) {
            return;
        }
        const buf = await res.clone().arrayBuffer();
        const bin = new Uint8Array(buf);
        const hashGot = await sha256(bin);
        const hashExp = base64Decode(hash);
        if (!hashExp) {
            return;
        }
        if (!isArrayEqual(hashGot, hashExp)) {
            console.warn('[FreeCDN/CacheManager] bad cache:', hash);
            delCache('/' + hash);
            return;
        }
        return res;
    }
    CacheManager.findHash = findHash;
    async function addHash(hash, res) {
        await addCache('/' + hash, res);
    }
    CacheManager.addHash = addHash;
    function findCache(reqInfo) {
        return mCache.match(reqInfo);
    }
    CacheManager.findCache = findCache;
    async function addCache(reqInfo, res) {
        try {
            await mCache.put(reqInfo, res);
        }
        catch {
        }
    }
    CacheManager.addCache = addCache;
    function delCache(reqInfo) {
        return mCache.delete(reqInfo);
    }
    CacheManager.delCache = delCache;
})(CacheManager || (CacheManager = {}));
class Database {
    constructor(name) {
        this.name = name;
    }
    open(opts) {
        const s = promisex();
        const req = indexedDB.open(this.name);
        req.onsuccess = () => {
            const idb = req.result;
            this.db = idb;
            idb.onclose = () => {
                console.warn('[FreeCDN/Database] indexedDB disconnected, reopen...');
                this.open(opts);
            };
            s.resolve();
        };
        req.onerror = (e) => {
            console.warn('[FreeCDN/Database] indexedDB open error:', e);
            s.reject(req.error);
        };
        req.onupgradeneeded = () => {
            const idb = req.result;
            for (const [k, v] of Object.entries(opts)) {
                idb.createObjectStore(k, v);
            }
        };
        return s;
    }
    close() {
        this.db.close();
    }
    get(table, key) {
        const s = promisex();
        const obj = this.getStore(table, 'readonly');
        const req = obj.get(key);
        req.onsuccess = () => {
            s.resolve(req.result);
        };
        req.onerror = () => {
            s.reject(req.error);
        };
        return s;
    }
    put(table, record) {
        const s = promisex();
        const obj = this.getStore(table, 'readwrite');
        const req = obj.put(record);
        req.onsuccess = () => {
            s.resolve();
        };
        req.onerror = () => {
            s.reject(req.error);
        };
        return s;
    }
    delete(table, key) {
        const s = promisex();
        const obj = this.getStore(table, 'readwrite');
        const req = obj.delete(key);
        req.onsuccess = () => {
            s.resolve();
        };
        req.onerror = () => {
            s.reject(req.error);
        };
        return s;
    }
    enum(table, callback, ...args) {
        const s = promisex();
        const obj = this.getStore(table, 'readonly');
        const req = obj.openCursor(...args);
        req.onsuccess = () => {
            const { result } = req;
            if (!result) {
                s.resolve();
                return;
            }
            const ret = callback(result.value);
            if (ret !== false) {
                result.continue();
            }
        };
        req.onerror = () => {
            s.reject(req.error);
        };
        return s;
    }
    getStore(table, mode) {
        return this.db
            .transaction(table, mode)
            .objectStore(table);
    }
}
var Network;
(function (Network) {
    const mDatabase = new Database('.freecdn');
    const mUrlInfoMap = new Map();
    function addUrlInfo(url, status, expire) {
        if (mUrlInfoMap.has(url)) {
            return;
        }
        const info = { url, status, expire };
        mUrlInfoMap.set(url, info);
        mDatabase.put('cache', info);
    }
    class HostInfo {
        constructor() {
            this.lastDoneTime = 0;
            this.lastErrTime = 0;
            this.pending = 0;
            // public protocol = 1
            this.errNum = 0;
            this.reqNum = 0;
            this.reqTimeAvg = -1;
            this.reqTimeSum = 0;
            // public speedAvg = 0
            // public speedSum = 0
        }
    }
    const mHostInfoMap = new Map();
    function getHostInfo(host) {
        let info = mHostInfoMap.get(host);
        if (!info) {
            info = new HostInfo();
            mHostInfoMap.set(host, info);
        }
        return info;
    }
    function getHostWeight(hostInfo, now) {
        // TODO: ...
        if (hostInfo.reqTimeAvg !== -1) {
            const delayScore = 100 - hostInfo.reqTimeAvg * 0.2;
            return Math.max(delayScore, 10);
        }
        return 50;
    }
    function getUrlWeight(url, now, hostWeightMap) {
        const urlInfo = mUrlInfoMap.get(url);
        if (urlInfo && urlInfo.expire < now) {
            if (urlInfo.status !== 200) {
                return -2;
            }
            // 该 URL 之前加载过
            // expire 值越大，已过期的概率越小，权重越高
            return 100 + urlInfo.expire;
        }
        // 当前站点默认权重 -1，低于免费站点，减少流量成本
        if (url[0] === '/') {
            return hostWeightMap.get(MY_HOST) ?? -1;
        }
        const host = getHostFromUrl(url);
        const hostInfo = mHostInfoMap.get(host);
        if (!hostInfo) {
            return hostWeightMap.get(host) ?? 50;
        }
        return getHostWeight(hostInfo, now);
    }
    Network.getUrlWeight = getUrlWeight;
    async function fetch(req) {
        const host = getHostFromUrl(req.url);
        const hostInfo = getHostInfo(host);
        hostInfo.pending++;
        const t0 = getTimeSec();
        let res;
        try {
            res = await NATIVE_FETCH(req);
        }
        catch (err) {
            parseFetchError(err, req, hostInfo, t0);
            throw err;
        }
        finally {
            hostInfo.pending--;
        }
        const maxAge = parseMaxAge(res.headers, t0);
        switch (res.status) {
            case 200:
                if (req.cache !== 'no-store') {
                    if (maxAge > 60) {
                        addUrlInfo(res.url, 200, t0 + maxAge);
                    }
                }
                break;
            case 404:
                addUrlInfo(res.url, 404, t0 + maxAge);
                break;
        }
        // 过期时间会在 expires 参数中会用到，避免重复分析
        res._maxage = maxAge;
        return res;
    }
    Network.fetch = fetch;
    const REG_NET_ERR = /^Failed to fetch|^NetworkError|^Could not connect/;
    function parseFetchError(err, req, hostInfo, t0) {
        if (!navigator.onLine) {
            return;
        }
        if (!REG_NET_ERR.test(err.message)) {
            return;
        }
        if (req.cache === 'only-if-cached') {
            return;
        }
        hostInfo.errNum++;
        hostInfo.lastErrTime = t0;
    }
    function parseMaxAge(headers, t0) {
        const cacheControl = headers.get('cache-control');
        if (cacheControl !== null) {
            if (cacheControl.includes('no-cache')) {
                return 0;
            }
            const m = cacheControl.match(/max-age="?(\d+)"?/);
            if (m) {
                return +m[1];
            }
        }
        const expires = headers.get('expires');
        if (expires !== null) {
            const t1 = Date.parse(expires) / 1000;
            if (t1) {
                return (t1 - t0) | 0;
            }
        }
        return 300 /* DEFAULT_MAX_AGE */;
    }
    function parseEntries(list) {
        const timeBase = performance.timeOrigin;
        for (const record of list) {
            const host = getHostFromUrl(record.name);
            const info = getHostInfo(host);
            info.reqNum++;
            info.lastDoneTime = timeBase + record.responseEnd;
            // time-allow-origin
            if (record.responseStart > 0) {
                const reqTime = record.responseStart - record.requestStart;
                info.reqTimeSum += reqTime;
                info.reqTimeAvg = info.reqTimeSum / info.reqNum;
            }
        }
    }
    async function init() {
        await mDatabase.open({
            'cache': {
                keyPath: 'url'
            },
        });
        const now = getTimeSec();
        // 读取 URL 历史信息
        await mDatabase.enum('cache', (item) => {
            if (item.expire < now) {
                mDatabase.delete('cache', item.url);
                return;
            }
            mUrlInfoMap.set(item.url, item);
        });
        // 跟踪每个 URL 的性能指标
        const entries = performance.getEntriesByType('resource');
        parseEntries(entries);
        const observer = new PerformanceObserver(entryList => {
            const entries = entryList.getEntries();
            parseEntries(entries);
        });
        observer.observe({
            entryTypes: ['resource']
        });
    }
    Network.init = init;
    function parseWeightConf(manifest) {
        const zone = navigator.language.toLowerCase();
        const zone0 = zone.split('-')[0];
        const weightParams = manifest.getParams('@weight ' + zone) ||
            manifest.getParams('@weight ' + zone0) ||
            manifest.getParams('@weight');
        if (!weightParams) {
            const obj = ZONE_HOST_SCORE[zone] || ZONE_HOST_SCORE['*'];
            return new Map(Object.entries(obj));
        }
        const map = new Map();
        for (const [k, v] of weightParams) {
            const num = +v;
            if (isNaN(num)) {
                continue;
            }
            map.set(k, num);
        }
        return map;
    }
    Network.parseWeightConf = parseWeightConf;
})(Network || (Network = {}));
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
function utf8ToBytes(str) {
    return TEXT_ENCODER.encode(str);
}
function bytesToUtf8(bytes) {
    return TEXT_DECODER.decode(bytes);
}
function bytesToAsc(bytes) {
    return bytes.reduce((s, v) => s + String.fromCharCode(v), '');
}
function base64Encode(bytes) {
    return btoa(bytesToAsc(bytes));
}
function base64Decode(str) {
    try {
        str = atob(str);
    }
    catch {
        return;
    }
    const bin = new Uint8Array(str.length);
    for (let i = 0; i < bin.length; i++) {
        bin[i] = str.charCodeAt(i);
    }
    return bin;
}
function parseJson(str) {
    try {
        return JSON.parse(str);
    }
    catch {
    }
}
function splitList(str) {
    str = str.trim();
    if (!str) {
        return [];
    }
    return str.split(/\s+/);
}
function parseStrOrB64(str) {
    // json string
    if (str[0] === '"') {
        str = parseJson(str);
        if (str === undefined) {
            return;
        }
        return utf8ToBytes(str);
    }
    // base64
    return base64Decode(str);
}
const TIME_UNIT = {
    '': 1,
    'ms': 1,
    's': 1000,
    'min': 1000 * 60,
    'h': 1000 * 3600,
    'd': 1000 * 3600 * 24,
    'y': 1000 * 3600 * 24 * 365,
};
function parseTime(str) {
    const m = str.match(/^([\d.]{1,9})(y|d|h|min|s|ms|)$/);
    if (!m) {
        return NaN;
    }
    const [, num, unit] = m;
    return +num * TIME_UNIT[unit];
}
function parseByteUnit(str) {
    const m = str.match(/^([\d.]{1,9})(k|K|M|G|)(i|)(b|B|)$/);
    if (!m) {
        return NaN;
    }
    const [, num, kMG, i, bB] = m;
    const exponent = kMG === 'k' ? 1 :
        kMG === 'K' ? 1 :
            kMG === 'M' ? 2 :
                kMG === 'G' ? 3 : 0;
    const base = i ? 1024 : 1000;
    const unit = bB === 'b' ? 8 : 1;
    return +num * base ** exponent / unit;
}
function getTimeSec() {
    return Date.now() / 1000 | 0;
}
function concatBufs(bufs, size = 0) {
    if (size === 0) {
        for (const v of bufs) {
            size += v.length;
        }
    }
    const ret = new Uint8Array(size);
    let pos = 0;
    for (const v of bufs) {
        ret.set(v, pos);
        pos += v.length;
    }
    return ret;
}
function isArrayEqual(b1, b2) {
    if (b1.length !== b2.length) {
        return false;
    }
    for (let i = 0; i < b1.length; i++) {
        if (b1[i] !== b2[i]) {
            return false;
        }
    }
    return true;
}
function getPair(str, delim) {
    const pos = str.indexOf(delim);
    if (pos === -1) {
        return [str];
    }
    return [
        str.substring(0, pos),
        str.substring(pos + delim.length)
    ];
}
function mergeMap(dst, src) {
    for (const [k, v] of src) {
        dst.set(k, v);
    }
}
/**
 * @param url absolute or relative url
 */
function stripUrlQuery(url) {
    const pos = url.indexOf('?');
    if (pos === -1) {
        return url;
    }
    return url.substring(0, pos);
}
/**
 * @param url absolute url
 */
function getHostFromUrl(url) {
    const m = url.match(/^https?:\/\/([^/]+)/);
    return m[1];
}
/**
 * @param url absolute or relative url
 */
function toRelUrl(url) {
    if (url.startsWith(ROOT_PATH)) {
        return url.substring(MY_ORIGIN.length);
    }
    return url;
}
async function sha256(buf) {
    const ret = await CRYPTO.digest('SHA-256', buf);
    return new Uint8Array(ret);
}
const ZONE_HOST_SCORE = {
    'zh-cn': {
        'ajax.cdnjs.com': 50,
        'cdnjs.cloudflare.com': 50,
        'cdn.jsdelivr.net': 80,
        'raw.githubusercontent.com': 10,
        'cdnjs.loli.net': 70,
        'lib.baomitu.com': 80,
        'lf6-cdn-tos.bytecdntp.com': 90,
        'cdn.staticfile.org': 90,
        'cdn.bootcss.com': 10,
        'cdn.bootcdn.net': 80,
        'unpkg.com': 50,
        'g.alicdn.com': 90,
        'pagecdn.io': 20,
        'ajax.aspnetcdn.com': 60,
        'ajax.googleapis.com': 10,
        'code.jquery.com': 20,
        'stackpath.bootstrapcdn.com': 30,
        'maxcdn.bootstrapcdn.com': 30,
        'cdn.datatables.net': 40,
        'twemoji.maxcdn.com': 40,
    },
    '*': {
        'ajax.cdnjs.com': 90,
        'cdnjs.cloudflare.com': 90,
        'cdn.jsdelivr.net': 40,
        'raw.githubusercontent.com': 10,
        'cdnjs.loli.net': 40,
        'lib.baomitu.com': 20,
        'lf6-cdn-tos.bytecdntp.com': 40,
        'cdn.staticfile.org': 20,
        'cdn.bootcss.com': 10,
        'cdn.bootcdn.net': 20,
        'unpkg.com': 40,
        'g.alicdn.com': 30,
        'pagecdn.io': 40,
        'ajax.aspnetcdn.com': 70,
        'ajax.googleapis.com': 90,
        'code.jquery.com': 50,
        'stackpath.bootstrapcdn.com': 40,
        'maxcdn.bootstrapcdn.com': 50,
        'cdn.datatables.net': 50,
        'twemoji.maxcdn.com': 50,
    },
};

//# sourceMappingURL=freecdn-main.js.map
