import Index from './notification/cookie-notification';
import CookiePreferences from './cookie-preferences';
import CookieManager from './cookies/cookie-manager';
import ServiceLoader from './services/service-loader';
import { Configuration, CookieConsentOptions } from '../types';
import ConfigurationResolver from './store/configuration-resolver';
import EventBus, { EventBusSubscription } from './store/event-bus';
import ConsentRevoke from './consent-revoke';
import { CookieAttributes } from 'js-cookie';

declare global {
  const Haven: typeof CookieConsent;
  interface Window {
    dataLayer: any[];
    ga: any;
    fbq: Function;
    _fbq: Function;
    Haven: typeof CookieConsent
  }
}

export default class CookieConsent {
  protected options: Configuration;
  protected cookieNotification: Index;
  protected cookiePreferences: CookiePreferences;
  protected cookieManager: CookieManager;
  protected serviceLoader: ServiceLoader;
  protected consentRevoke: ConsentRevoke;

  constructor(options: CookieConsentOptions) {
    const config = ConfigurationResolver.resolve(options);
    this.cookieNotification = new Index(config);
    this.cookiePreferences = new CookiePreferences(config);
    this.cookieManager = new CookieManager(config);
    this.serviceLoader = new ServiceLoader(config);
    this.consentRevoke = new ConsentRevoke(config);
    this.options = config;
  }

  public init(): void {
    document.addEventListener('DOMContentLoaded', () => {
      this.cookieNotification.init();
      this.cookiePreferences.init();
    });
    this.registerDefaultListeners();
    this.checkInitialState();
  }

  protected checkInitialState(): void {
    if (this.cookieManager.hasFunctionalCookie()) {
      EventBus.emit('functional-enabled');
    }
    if (this.cookieManager.hasAnalyticsEnabled()) {
      EventBus.emit('analytics-enabled');
    }
    if (this.cookieManager.hasMarketingEnabled()) {
      EventBus.emit('marketing-enabled');
    }
  }

  protected registerDefaultListeners(): void {
    // Inject analytics services once analytics cookies have been accepted
    EventBus.on('analytics-enabled', () => {
      if (this.options.inject.length) {
        this.serviceLoader.injectServices();
      }
    });
    // Remove analytics cookies when analytics cookie consent is revoked
    EventBus.on('analytics-disabled', () => {
      this.consentRevoke.destroyAnalyticsServices();
    });
  }

  public getOptions(): Configuration {
    return this.options;
  }

  /**
   * Proxy event bus subscription method to the event bus singleton so that users can call this method
   * anywhere in their application.
   * @param event
   * @param callback
   */
  public static on(event: string, callback: Function): EventBusSubscription {
    return EventBus.on(event, callback);
  }

  public static create(options: CookieConsentOptions): CookieConsent {
    const haven = new CookieConsent(options);
    haven.init();
    return haven;
  }

  public static removeCookies(cookies: string[], options?: CookieAttributes) {
    for (const cookie of cookies) {
      CookieManager.removeCookie(cookie, options);
    }
  }
}

