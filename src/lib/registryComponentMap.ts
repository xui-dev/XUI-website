import type { ComponentType } from "react";

/**
 * Registry Component Map
 * High-performance AOT Code-Split dictionary for statically known components.
 * Dynamically registered components render instantly as Native React with 0ms compilation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registryComponentMap: Record<string, ComponentType<any>> = {};

export default registryComponentMap;
