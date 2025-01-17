import { ConsentType, CookieAttributes, Purpose } from "../types";
import Cookies from "./cookies";
import EventBus from "../store/event-bus";
import { getAllPurposes } from "../utils";

export default class CookieManager {
  /** Cookie prefix */
  protected prefix: string;
  /** Consent type: opt-in / opt-out */
  protected type: ConsentType;
  protected attributes: CookieAttributes;

  constructor(
    prefix: string,
    type: ConsentType = "opt-in",
    attributes: CookieAttributes = {}
  ) {
    this.prefix = prefix;
    this.type = type;
    this.attributes = attributes;
  }

  /**
   * Get cookie by name.
   * @param name
   */
  public static getCookie(name: string): string | undefined {
    return Cookies.get(name);
  }

  /**
   * Set cookie by name.
   * @param name
   * @param value
   * @param options
   */
  public static setCookie(
    name: string,
    value: string,
    options?: CookieAttributes
  ): void {
    Cookies.set(name, value, options);
  }

  /**
   * Remove cookie by name.
   * @param name
   * @param options
   */
  public static removeCookie(
    name: string | RegExp,
    options?: CookieAttributes
  ): void {
    Cookies.remove(name, options);
  }

  /**
   * Check whether cookie exists.
   * @param name
   */
  public static cookieExists(name: string): boolean {
    return Cookies.get(name) !== undefined && Cookies.get(name) !== "";
  }

  /**
   * Enable the functional cookie.
   */
  public setCookiesDefault(): void {
    const purposes = getAllPurposes();
    for (const purpose of purposes) {
      // If purpose not set, set it to false by default
      if (!CookieManager.cookieExists(`${this.prefix}-${purpose}`)) {
        this.disableCookies(purpose);
      }
    }
  }

  /**
   * Enable the functional cookie.
   */
  public enableFunctionalCookie(): void {
    CookieManager.setCookie(
      `${this.prefix}-functional`,
      "true",
      this.attributes
    );
    EventBus.emit("functional-enabled");
  }

  /**
   * Check whether the functional cookie has been set.
   */
  public hasFunctionalCookie(): boolean {
    return CookieManager.cookieExists(`${this.prefix}-functional`);
  }

  /**
   * Enable cookies for a given purpose (e.g. analytics).
   * @param purpose
   */
  public enableCookies(purpose: Purpose): void {
    CookieManager.setCookie(
      `${this.prefix}-${purpose}`,
      "true",
      this.attributes
    );
    EventBus.emit(`${purpose}-enabled`);
  }

  /**
   * Disable cookies for a given purpose (e.g. analytics).
   * @param purpose
   */
  public disableCookies(purpose: Purpose): void {
    CookieManager.setCookie(
      `${this.prefix}-${purpose}`,
      "false",
      this.attributes
    );
    EventBus.emit(`${purpose}-disabled`);
  }

  /**
   * Check whether cookies for all purposes have been set (regardless of whether they have been accepted or not).
   */
  public hasAllCookiesSet(): boolean {
    const purposes = getAllPurposes();
    for (const purpose of purposes) {
      if (!CookieManager.cookieExists(`${this.prefix}-${purpose}`)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check whether cookies for a given purpose are enabled (e.g. analytics).
   * @param purpose
   */
  public hasCookiesEnabled(purpose: Purpose): boolean {
    const cookie = CookieManager.getCookie(`${this.prefix}-${purpose}`);

    if (this.type === "opt-in") {
      return cookie === "true";
    }

    return cookie === undefined || cookie === "true";
  }

  /**
   * Check whether cookies for all purposes have been accepted.
   * @param purposes
   */
  public hasAllNecessaryCookiesEnabled(purposes: Purpose[] = []): boolean {
    for (const purpose of purposes) {
      if (!this.hasCookiesEnabled(purpose)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Accept all cookies.
   */
  public enableAllCookies(): void {
    const purposes = ["functional", ...getAllPurposes()];
    purposes.map(purpose => this.enableCookies(purpose));
  }

  /**
   * Decline all cookies.
   */
  public disableAllCookies(): void {
    getAllPurposes().map(purpose => this.disableCookies(purpose));
  }
}
