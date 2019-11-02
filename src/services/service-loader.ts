import { injectFacebookPixel } from './facebook-pixel';
import { injectGoogleAnalytics } from './google-analytics';
import { injectGoogleTagManager } from './google-tag-manager';
import store from '../store';
import EventBus from '../store/event-bus';
import { HavenService, Purpose } from '../../types';
import CookieManager from '../cookies/cookie-manager';

export default class ServiceLoader {
  protected cookieManager: CookieManager;

  constructor() {
    this.cookieManager = new CookieManager(store.prefix, store.type);
  }

  /**
   * Inject all registered services.
   */
  public injectServices(): void {
    console.log(store.services);
    for (const service of store.services) {
      this.injectService(service);
      EventBus.emit('service-loaded', service.name);
    }
    EventBus.emit('services-loaded');
  }

  /**
   * Inject a specific service, if all requirements are met (cookies accepted _or_ service is required).
   * @param service
   */
  public injectService(service: HavenService) {
    if (service.required !== true && !this.cookieManager.hasAllNecessaryCookiesEnabled(service.purposes)) {
      return;
    }

    let injector: Function  | undefined;
    if (service.inject === true) {
      injector = this.getDefaultInjector(service.name);
      if (injector === undefined) {
        console.error(`No default injector found for ${service.name}. Please specify your own inject implementation.`);
        return;
      }
    } else if (service.inject) {
      injector = service.inject;
    }

    if (injector !== undefined && service.id !== undefined) {
      injector(service.id);
    } else if (injector !== undefined) {
      injector();
    }
  }

  /**
   * Get the default injector if it exists.
   * @param name
   */
  public getDefaultInjector(name: string): Function | undefined {
    switch (name) {
      case 'google-analytics':
        return injectGoogleAnalytics;
      case 'google-tag-manager':
        return injectGoogleTagManager;
      case 'facebook-pixel':
        return injectFacebookPixel;
      default:
        return undefined;
    }
  }

  /**
   * Dynamically register and inject a new service.
   * @param name
   * @param purposes
   * @param inject
   * @param options
   */
  public registerService(
    name: string,
    purposes: Purpose[],
    inject: boolean | Function,
    options: Partial<HavenService> = {},
  ) {
    const service = {
      name: name,
      purposes: purposes,
      inject: inject,
      ...options,
    };
    store.services.push(service);
    this.injectService(service);
  }
}
