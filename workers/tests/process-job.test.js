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
const process_job_1 = __importDefault(require("../src/tasks/process-job"));
const logUtils_1 = __importDefault(require("../src/utils/logUtils"));
const correctJob = {
    name: "test",
    id: "",
    event: { name: "test", payload: "test", type: "complete" },
    cache: {},
};
const incorrectJobOne = {
    name: "test",
};
const incorrectJobTwo = {
    event: { name: "test", payload: "test" },
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
beforeEach(() => {
    jest.clearAllMocks();
});
const mockHelpers = {
    job: {
        payload: {},
        attempts: 1,
        max_attempts: 5,
    },
};
test("incorrect job format dead letter queues and resolves", () => {
    expect((0, process_job_1.default)(incorrectJobOne, mockHelpers)).resolves.toBeUndefined();
    expect((0, process_job_1.default)(incorrectJobTwo, mockHelpers)).resolves.toBeUndefined();
    expect(logUtils_1.default.error).toHaveBeenCalledTimes(4);
});
test("throws an error when it can't connect to Function server", () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("failed")));
    expect(() => (0, process_job_1.default)(correctJob, mockHelpers)).rejects.toThrow();
});
test("throws an error when invalid RPCResponse", () => {
    global.fetch = jest.fn(() => Promise.resolve({
        json: () => __awaiter(void 0, void 0, void 0, function* () {
            return {};
        }),
    }));
    expect(() => (0, process_job_1.default)(correctJob, mockHelpers)).rejects.toThrow();
});
test("throws an error on valid RPCResponse that has an error property", () => {
    let errorRPCResponse = {
        error: "error",
        id: "id",
    };
    global.fetch = jest.fn(() => Promise.resolve({
        json: () => __awaiter(void 0, void 0, void 0, function* () {
            return errorRPCResponse;
        }),
    }));
    expect(() => (0, process_job_1.default)(correctJob, mockHelpers)).rejects.toThrow();
});
test("does not throw an error on valid RPC response that has a result property", () => __awaiter(void 0, void 0, void 0, function* () {
    let resultRPCResponse = {
        result: {
            type: "complete",
            stepId: "step-id",
            stepValue: "any",
        },
        id: "id",
    };
    global.fetch = jest.fn(() => Promise.resolve({
        json: () => __awaiter(void 0, void 0, void 0, function* () {
            return resultRPCResponse;
        }),
    }));
    (0, process_job_1.default)(correctJob, mockHelpers).then((val) => expect(val).toBeUndefined());
}));
describe("Logger", () => {
    test("logs an error on incorrect job", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, process_job_1.default)(incorrectJobOne, mockHelpers);
        }
        catch (_a) {
        }
        finally {
            expect(logUtils_1.default.error).toHaveBeenCalled();
        }
    }));
    test("logs an error when it can't connect to Function server", () => __awaiter(void 0, void 0, void 0, function* () {
        global.fetch = jest.fn(() => Promise.reject(new Error("failed")));
        try {
            yield (0, process_job_1.default)(correctJob, mockHelpers);
        }
        catch (_b) {
        }
        finally {
            expect(logUtils_1.default.error).toHaveBeenCalled();
        }
    }));
    test("logs an error when invalid RPCResponse", () => __awaiter(void 0, void 0, void 0, function* () {
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => __awaiter(void 0, void 0, void 0, function* () {
                return {};
            }),
        }));
        try {
            yield (0, process_job_1.default)(correctJob, mockHelpers);
        }
        catch (_c) {
        }
        finally {
            expect(logUtils_1.default.error).toHaveBeenCalled();
        }
    }));
    test("logs an error on valid RPCResponse that has an error property", () => __awaiter(void 0, void 0, void 0, function* () {
        let errorRPCResponse = {
            error: "error",
            id: "id",
        };
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => __awaiter(void 0, void 0, void 0, function* () {
                return errorRPCResponse;
            }),
        }));
        try {
            yield (0, process_job_1.default)(correctJob, mockHelpers);
        }
        catch (_d) {
        }
        finally {
            expect(logUtils_1.default.error).toHaveBeenCalled();
        }
    }));
    test("logs a warning on RPCResponse without result field", () => __awaiter(void 0, void 0, void 0, function* () {
        let resultRPCResponse = {
            id: "id",
        };
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => __awaiter(void 0, void 0, void 0, function* () {
                return resultRPCResponse;
            }),
        }));
        yield (0, process_job_1.default)(correctJob, mockHelpers);
        expect(logUtils_1.default.warn).toHaveBeenCalled();
    }));
    test("logs on function complete", () => __awaiter(void 0, void 0, void 0, function* () {
        let resultRPCResponse = {
            id: "id",
            result: {
                type: "complete",
            },
        };
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => __awaiter(void 0, void 0, void 0, function* () {
                return resultRPCResponse;
            }),
        }));
        yield (0, process_job_1.default)(correctJob, mockHelpers);
        expect(logUtils_1.default.info).toHaveBeenCalled();
    }));
    test("logs on step.run", () => __awaiter(void 0, void 0, void 0, function* () {
        let resultRPCResponse = {
            id: "id",
            result: {
                type: "step",
                stepId: "string",
                stepValue: "any",
            },
        };
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => __awaiter(void 0, void 0, void 0, function* () {
                return resultRPCResponse;
            }),
        }));
        yield (0, process_job_1.default)(correctJob, {
            addJob: () => { },
            job: mockHelpers.job,
        });
        expect(logUtils_1.default.info).toHaveBeenCalled();
    }));
    test("logs on step.delay", () => __awaiter(void 0, void 0, void 0, function* () {
        let resultRPCResponse = {
            id: "id",
            result: {
                type: "delay",
                stepId: "string",
                delayInMs: 0,
            },
        };
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => __awaiter(void 0, void 0, void 0, function* () {
                return resultRPCResponse;
            }),
        }));
        yield (0, process_job_1.default)(correctJob, {
            addJob: () => { },
            job: mockHelpers.job,
        });
        expect(logUtils_1.default.info).toHaveBeenCalled();
    }));
    test("logs on step.invoke", () => __awaiter(void 0, void 0, void 0, function* () {
        let resultRPCResponse = {
            id: "id",
            result: {
                type: "invoke",
                stepId: "string",
                invokedFnName: "string",
            },
        };
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => __awaiter(void 0, void 0, void 0, function* () {
                return resultRPCResponse;
            }),
        }));
        yield (0, process_job_1.default)(correctJob, {
            addJob: () => { },
            job: mockHelpers.job,
        });
        expect(logUtils_1.default.info).toHaveBeenCalled();
    }));
    test("logs on step.emitEvent", () => __awaiter(void 0, void 0, void 0, function* () {
        let resultRPCResponse = {
            id: "id",
            result: {
                type: "emitEvent",
                stepId: "string",
                eventId: "string",
            },
        };
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => __awaiter(void 0, void 0, void 0, function* () {
                return resultRPCResponse;
            }),
        }));
        yield (0, process_job_1.default)(correctJob, {
            addJob: () => { },
            job: mockHelpers.job,
        });
        expect(logUtils_1.default.info).toHaveBeenCalled();
    }));
});
