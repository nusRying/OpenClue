declare module 'openclaw/plugin-sdk/plugin-entry' {
  export function definePluginEntry(definition: {
    id?: string;
    name?: string;
    description?: string;
    kind?: string;
    configSchema?: unknown;
    reload?: unknown;
    nodeHostCommands?: unknown;
    securityAuditCollectors?: unknown;
    register: (api: OpenClawPluginApi) => void;
  }): unknown;

  interface OpenClawPluginApi {
    on(event: 'before_tool_call', handler: (ctx: ToolCallContext) => { block: boolean } | void): void;
    on(event: 'after_tool_call', handler: (ctx: ToolResultContext) => void): void;
    registerService(service: unknown): void;
  }

  interface ToolCallContext {
    block: boolean;
    toolName: string;
    params: Record<string, unknown>;
    sessionKey: string;
    agentId?: string;
  }

  interface ToolResultContext {
    toolName: string;
    result: unknown;
    sessionKey: string;
    error?: {
      message?: string;
      code?: string;
    };
  }
}
