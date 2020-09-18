import { LogLevel, Logger, ConsoleListener } from '@pnp/logging';

const _logger:Logger = null;
const qs = new URLSearchParams(window.location.search);
const listener = new ConsoleListener();

let lvl : string = "";

if(qs.get("log") === "1") {
    Logger.subscribe(listener);
    console.log("[MSWP.LogService]: Console logging enabled.");
} else {
    console.log("[MSWP.LogService]: Console logging disabled.");
}

Logger.activeLogLevel = LogLevel.Verbose;

if(lvl = qs.get("lvl")) {
    switch(lvl) {
        case "info":
            Logger.activeLogLevel = LogLevel.Info;
            break;
        case "error":
            Logger.activeLogLevel = LogLevel.Error;
            break;
        case "off":
            Logger.activeLogLevel = LogLevel.Off;
            break;
        case "verbose":
            Logger.activeLogLevel = LogLevel.Verbose;
            break;
        case "warning":
            Logger.activeLogLevel = LogLevel.Warning;
            break;
    }
}

export default Logger;