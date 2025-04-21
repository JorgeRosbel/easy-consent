export {} // this file is a module, so `declare global` works
import { ConsentUpdateEvent } from "./types"

declare global {
  interface Cookie {
    name: string
    value: string
    domain?: string
    path?: string
    expires?: number
    secure?: boolean
    sameSite?: "Strict" | "Lax" | "None"
  }

  interface CookieStore {
    get(name?: string): Promise<Cookie>
    getAll(): Promise<Cookie[]>
    set(details: {
      name: string
      value: string
      path?: string
      maxAge?: number
      expires?: number
      secure?: boolean
      sameSite?: "Strict" | "Lax" | "None"
      priority?: "Low" | "Medium" | "High"
    }): Promise<void>
    delete(name: string): Promise<void>
  }

  /** The global `cookieStore` object. */
  var cookieStore: CookieStore
}


declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

declare global {
    interface WindowEventMap {
        'consent-updated': ConsentUpdateEvent;
    }
}