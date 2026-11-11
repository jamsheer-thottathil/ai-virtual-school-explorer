/// <reference types="vite/client" />

declare module 'pannellum/build/pannellum.js';

interface PannellumViewer {
  destroy(): void;
  on(event: string, handler: (...args: unknown[]) => void): PannellumViewer;
  getYaw(): number;
  getPitch(): number;
  getHfov(): number;
  setHfov(hfov: number, animated?: boolean | number): PannellumViewer;
  setYaw(yaw: number, animated?: boolean | number): PannellumViewer;
  isLoaded(): boolean;
  toggleFullscreen(): PannellumViewer;
  resize(): void;
}

interface PannellumStatic {
  viewer(container: HTMLElement | string, config: Record<string, unknown>): PannellumViewer;
}

interface Window {
  pannellum?: PannellumStatic;
}
