"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_cron_1 = __importDefault(require("../src/tasks/process-cron"));
const logUtils_1 = __importDefault(require("../src/utils/logUtils"));
const validCronJob = { funcName: "my-function" };
const funcPayload = {
    name: "my-function",
    id: "uuid1234567891011121314",
    event: { name: "event1", id: "uuid1234567891011121315" },
    cache: {},
};
const eventPayload = {
    name: "event1",
    id: "uuid1234567891011121315",
    payload: { test: true },
};
jest.mock("../src/utils/logUtils", () => {
    return {
        info: () => { },
        warn: () => { },
        error: () => { },
    };
});
jest.spyOn(logUtils_1.default, "info");
jest.spyOn(logUtils_1.default, "warn");
jest.spyOn(logUtils_1.default, "error");
const mockAddJob = jest.fn((task, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!!payload && typeof payload === "object" && "funcName" in payload) {
        return {
            payload: { name: payload.funcName },
            attempts: 1,
            max_attempts: 5,
        };
    }
    else {
        return { payload: {}, attempts: 1, max_attempts: 5 };
    }
}));
const mockHelpers = {
    job: {
        payload: {},
        attempts: 1,
        max_attempts: 5,
    },
    addJob: mockAddJob,
};
beforeEach(() => {
    jest.clearAllMocks();
});
test("invalid cron job throws an error", () => __awaiter(void 0, void 0, void 0, function* () {
    yield expect((0, process_cron_1.default)(funcPayload, mockHelpers)).rejects.toThrow(/Cron format is not valid/);
    yield expect((0, process_cron_1.default)(eventPayload, mockHelpers)).rejects.toThrow(/Cron format is not valid/);
}));
test("addJob is called with the correct arguments", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, process_cron_1.default)(validCronJob, mockHelpers);
    expect(mockHelpers.addJob).toHaveBeenCalledWith("process_job", expect.objectContaining({
        name: "my-function",
        id: expect.any(String),
        event: { name: "cron", id: "" },
        cache: {},
    }), { maxAttempts: expect.any(Number) });
}));
test("logs an error on incorrect job", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, process_cron_1.default)(funcPayload, mockHelpers);
    }
    catch (_a) {
    }
    finally {
        expect(logUtils_1.default.error).toHaveBeenCalledTimes(1);
    }
}));
test("logs on function payload enqueued", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, process_cron_1.default)(validCronJob, mockHelpers);
    expect(logUtils_1.default.info).toHaveBeenCalledTimes(1);
}));
