import CookieManager from "../cookies/cookie-manager";
import store from "../store";
import EventBus from "../store/event-bus";
import DefaultPreferences from "./default-preferences";
import { getAllPurposes } from "../utils";

export default class CookiePreferences {
  /** Cookie manager instance */
  protected cookieManager: CookieManager;
  /** Button for saving preferences */
  protected saveButton: HTMLButtonElement | null = null;

  /**
   * Fetch DOM elements.
   */
  constructor() {
    this.cookieManager = new CookieManager(
      store.prefix,
      store.type,
      store.cookieAttributes
    );
  }

  /**
   * Initialize cookie preferences initial states and event listeners.
   */
  public init(): void {
    const wrapper = document.getElementById("cookie-preferences");
    if (wrapper !== null) {
      DefaultPreferences.create(wrapper);
    }
    this.attachListeners();
  }

  /**
   * Attach event listeners to all checkboxes.
   */
  public attachListeners(): void {
    const purposes = getAllPurposes();
    const checkboxes: { [purpose: string]: HTMLInputElement } = {};
    const saveButton = document.getElementById(
      "cookie-preferences__save"
    ) as HTMLButtonElement;

    for (const purpose of purposes) {
      const checkbox = <HTMLInputElement | null>(
        document.getElementById(`cookie-preferences--${purpose}`)
      );
      if (checkbox !== null) {
        checkboxes[purpose] = checkbox;
        checkbox.checked = this.cookieManager.hasCookiesEnabled(purpose);
        checkbox.addEventListener("change", () => {
          EventBus.emit("preferences-change");
          if (saveButton !== null) {
            saveButton.disabled = false;
            return;
          }
          this.cookieManager.enableFunctionalCookie();
          this.cookieManager.setCookiesDefault();
          if (checkbox.checked) {
            this.cookieManager.enableCookies(purpose);
          } else {
            this.cookieManager.disableCookies(purpose);
          }
        });
      }
    }

    if (saveButton !== null) {
      saveButton.addEventListener("click", () => {
        this.cookieManager.enableFunctionalCookie();
        for (const purpose of purposes) {
          if (checkboxes[purpose].checked) {
            this.cookieManager.enableCookies(purpose);
          } else {
            this.cookieManager.disableCookies(purpose);
          }
        }
        const notification = document.getElementById("cookie-notification");
        if (notification !== null) {
          notification.style.display = "none";
        }
        saveButton.disabled = true;
      });
    }
  }
}
