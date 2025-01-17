import CookieManager from "../cookies/cookie-manager";
import DefaultNotification from "./default-notification";
import store from "../store";
import EventBus from "../store/event-bus";
import { getAllPurposes } from "../utils";

const Status = {
  ENABLED: true,
  DISABLED: false
};

export default class CookieNotification {
  protected cookieManager: CookieManager;
  /** Wrapper element for the cookie notification */
  protected cookieNotification: HTMLElement | null = null;
  /** Button for accepting cookies */
  protected cookiesAccept: HTMLElement | null = null;
  /** Button for declining cookies */
  protected cookiesDecline: HTMLElement | null = null;

  constructor() {
    this.cookieManager = new CookieManager(
      store.prefix,
      store.type,
      store.cookieAttributes
    );
  }

  /**
   * Initialize cookie notification and its event listeners.
   */
  public init(): void {
    // Use custom cookie notification if present
    this.cookieNotification = document.getElementById("cookie-notification");

    // If no custom cookie notification is found, create a default one.
    if (this.cookieNotification === null) {
      DefaultNotification.create();
      this.cookieNotification = document.getElementById("cookie-notification");
    }

    // Fetch action buttons
    this.cookiesAccept = document.getElementById("cookie-notification__accept");
    this.cookiesDecline = document.getElementById(
      "cookie-notification__decline"
    );

    // Only show cookie notification when a purpose has not been set yet
    // This also allows us to show the cookie notification again when at some point in the future
    // we decide to add an additional purpose
    if (
      this.cookieNotification !== null &&
      !this.cookieManager.hasAllCookiesSet()
    ) {
      this.showCookieNotification();
    }

    // Accept all cookies
    if (this.cookiesAccept !== null) {
      this.cookiesAccept.addEventListener("click", event => {
        this.cookieManager.enableAllCookies();
        this.hideCookieNotification();
        this.togglePreferences(Status.ENABLED);
      });
    }

    // Decline all but the functional cookie
    if (this.cookiesDecline !== null) {
      this.cookiesDecline.addEventListener("click", event => {
        // Only set the functional cookie.
        this.cookieManager.disableAllCookies();
        this.cookieManager.enableFunctionalCookie();
        this.hideCookieNotification();
        this.togglePreferences(Status.DISABLED);
      });
    }

    // Make sure notification is hidden whenever a change to preferences happen
    const purposes = getAllPurposes();

    for (const purpose of purposes) {
      EventBus.on(
        `${purpose}-disabled`,
        this.hideCookieNotification.bind(this)
      );
    }
  }

  /**
   * Show cookie notification.
   */
  public showCookieNotification(): void {
    if (this.cookieNotification !== null) {
      this.cookieNotification.style.display =
        this.cookieNotification.dataset.display || "block";
      this.cookieNotification.classList.remove("hv-notification--hidden");
    }
  }

  /**
   * Hide cookie notification.
   */
  public hideCookieNotification(): void {
    if (this.cookieNotification !== null) {
      this.cookieNotification.style.display = "none";
    }
  }

  /**
   * Toggle the state of all preferences checkboxes once an action on the cookie notification has been made.
   * @param enabled
   */
  protected togglePreferences(enabled: boolean): void {
    const purposes = getAllPurposes();
    for (const purpose of purposes) {
      const checkbox = <HTMLInputElement | null>(
        document.getElementById(`cookie-preferences--${purpose}`)
      );
      if (checkbox) {
        checkbox.checked = enabled;
      }
    }
  }
}
