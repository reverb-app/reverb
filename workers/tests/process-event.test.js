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
const process_event_1 = __importDefault(require("../src/tasks/process-event"));
const uuid_1 = require("uuid");
const logUtils_1 = __importDefault(require("../src/utils/logUtils"));
const correctEvent = {
    name: "test_event",
    id: (0, uuid_1.v4)(),
    payload: { key: "value" },
};
const incorrectEventOne = {
    id: (0, uuid_1.v4)(),
};
const incorrectEventTwo = {
    name: "test_event",
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
        attempts: 0,
        max_attempts: 0,
    },
};
test("invalid event format dead letter queues and resolves", () => {
    expect((0, process_event_1.default)(incorrectEventOne, mockHelpers)).resolves.toBeUndefined();
    expect(logUtils_1.default.error).toHaveBeenCalledTimes(2);
});
describe("Logger", () => {
    test("logs an error on incorrect job", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, process_event_1.default)(incorrectEventOne, mockHelpers);
        }
        catch (_a) {
        }
        finally {
            expect(logUtils_1.default.error).toHaveBeenCalled();
        }
    }));
    test("logs on event complete", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, process_event_1.default)(correctEvent, {
            addJob: () => { },
            query: () => {
                return { job: mockHelpers.job, rows: [{ name: "test_function" }] };
            },
        });
        expect(logUtils_1.default.info).toHaveBeenCalled();
    }));
    test("logs a warning when event has no functions", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, process_event_1.default)(correctEvent, {
            query: () => {
                return {
                    job: mockHelpers.job,
                    rows: [],
                };
            },
        });
        expect(logUtils_1.default.warn).toHaveBeenCalled();
    }));
    test("logs for each function invoked by event", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, process_event_1.default)(correctEvent, {
            addJob: () => { },
            query: () => {
                return {
                    job: mockHelpers.job,
                    rows: [{ name: "test_function1" }, { name: "test_function2" }],
                };
            },
        });
        expect(logUtils_1.default.info).toHaveBeenCalledTimes(3);
    }));
});
