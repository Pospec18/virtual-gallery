import { KeyboardEvent } from "react";

type InputState = {
    leftButton: boolean,
    rightButton: boolean,
    mouseXDelta: number,
    mouseYDelta: number,
    mouseX: number,
    mouseY: number
}

export class InputController {
    target;
    current: InputState;
    previous: InputState | null;
    keys: Map<string, boolean>;
    previousKeys: Map<string, boolean>;

    constructor(target? : any) {
      this.target = target || document;
      this.current = {
        leftButton: false,
        rightButton: false,
        mouseXDelta: 0,
        mouseYDelta: 0,
        mouseX: 0,
        mouseY: 0,
      };
      this.previous = null;
      this.keys = new Map<string, boolean>();
      this.previousKeys = new Map<string, boolean>();
      this.target.addEventListener('mousedown', (e: MouseEvent) => this.onMouseDown(e), false);
      this.target.addEventListener('mousemove', (e: MouseEvent) => this.onMouseMove(e), false);
      this.target.addEventListener('mouseup', (e: MouseEvent) => this.onMouseUp(e), false);
      this.target.addEventListener('keydown', (e: KeyboardEvent) => this.onKeyDown(e), false);
      this.target.addEventListener('keyup', (e: KeyboardEvent) => this.onKeyUp(e), false);
    }

    onMouseMove(e: MouseEvent) {
      this.current.mouseX = e.pageX - window.innerWidth / 2;
      this.current.mouseY = e.pageY - window.innerHeight / 2;

      if (this.previous === null) {
        this.previous = {...this.current};
      }

      this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX;
      this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY;
    }

    onMouseDown(e: MouseEvent) {
      this.onMouseMove(e);

      switch (e.button) {
        case 0: {
          this.current.leftButton = true;
          break;
        }
        case 2: {
          this.current.rightButton = true;
          break;
        }
      }
    }

    onMouseUp(e: MouseEvent) {
      this.onMouseMove(e);

      switch (e.button) {
        case 0: {
          this.current.leftButton = false;
          break;
        }
        case 2: {
          this.current.rightButton = false;
          break;
        }
      }
    }

    onKeyDown(e: KeyboardEvent) {
      this.keys.set(e.key, true);
    }

    onKeyUp(e: KeyboardEvent) {
      this.keys.set(e.key, false);
    }

    key(keyCode: string) {
      return this.keys.get(keyCode)
    }

    isReady() {
      return this.previous !== null;
    }

    update(_: any) {
      if (this.previous !== null) {
        this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX;
        this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY;

        this.previous = {...this.current};
      }
    }
};