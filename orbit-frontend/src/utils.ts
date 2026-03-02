import type { Op } from "./chatroom/types";
import { CURSOR_PAL } from "./chatroom/constants";
import cockImg from "./assets/cock.jpg";

export function computeOp(oldCode: string, newCode: string): Op {
    let start = 0;
    while (start < oldCode.length && start < newCode.length && oldCode[start] === newCode[start]) start++;
    let oldEnd = oldCode.length;
    let newEnd = newCode.length;
    while (oldEnd > start && newEnd > start && oldCode[oldEnd - 1] === newCode[newEnd - 1]) { oldEnd--; newEnd--; }
    return { pos: start, del: oldEnd - start, ins: newCode.slice(start, newEnd) };
}

export function applyOp(code: string, op: Op): string {
    return code.slice(0, op.pos) + op.ins + code.slice(op.pos + op.del);
}

export function shiftCursor(cursor: number, op: Op): number {
    if (op.pos >= cursor) return cursor;
    if (op.pos + op.del <= cursor) return cursor - op.del + op.ins.length;
    return op.pos + op.ins.length;
}

export function curCol(name: string): string {
    return CURSOR_PAL[name.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % CURSOR_PAL.length];
}

export function roomCover(_name: string): string {
    return cockImg;
}