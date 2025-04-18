
export type Mode = "denied" | "granted"

export interface Config {
    ad_storage:Mode,
    analytics_storage: Mode,
    functionality_storage:Mode,
    personalization_storage: Mode,
    ad_user_data: Mode,
    ad_personalization: Mode,
    security_storage: Mode
}

export type Options = keyof Config