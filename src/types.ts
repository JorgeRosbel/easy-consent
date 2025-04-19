
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

export type PartialConfig = Partial<Config>

export type Options = keyof Config


export type ConsentEventKey = Options | 'all' ;
export type ConsentEventMode = Mode | 'accept-all' | 'reject-all';
export interface ConsentUpdateEventDetail {
    key: ConsentEventKey;
    mode: ConsentEventMode;
    state: Config;
    timestamp: string;
}

export interface ConsentUpdateEvent extends CustomEvent {
    detail: ConsentUpdateEventDetail;
}




