export interface Translations {
  [lang: string]: Translation;
}

export interface Translation {
  notification?: NotificationTranslation;
  preferences?: PreferencesTranslation;
  purposes?: Purposes;
}

export interface NotificationTranslation {
  message?: string;
  policy?: string;
  accept?: string;
  decline?: string;
}

export interface PreferencesTranslation {
  description?: string;
  save?: string;
  saved?: string;
}

export interface Purposes {
  [identifier: string]: Purpose;
}

export interface Purpose {
  name?: string;
  description?: string;
}
