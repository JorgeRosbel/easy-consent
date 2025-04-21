import { type Mode, 
    type Options, 
    Config, 
    type ConsentEventKey, 
    type ConsentEventMode, 
    ConsentUpdateEventDetail, 
    ConsentUpdateEvent,
    type PartialConfig } from "./types";

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

export class EasyConsent {
    public isNewUser:boolean
    public state:Config;
    private head:HTMLElement
    private analytics_lib:HTMLElement
    private init_consent:HTMLElement
    private init_GA:HTMLElement
    private consentConfigDuration = 180;


    private getCookie(name: string) {

    
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            const [key, value] = cookie.split("=");
            if (key === name) {
                try {

                    return JSON.parse(decodeURIComponent(value));
                } catch (error) {
                    console.error("Error al parsear el contenido de la cookie:", error);
                    return null;
                }
            }
        }
        return null;
    }


    private setCookie(name: string, value: Config, days: number) {
        const jsonValue = JSON.stringify(value);
        const encodedValue = encodeURIComponent(jsonValue);
        const expires = days
            ? "; expires=" + new Date(Date.now() + days * 864e5).toUTCString()
            : "";
            document.cookie = `${name}=${encodedValue}${expires}; path=/; SameSite=Lax; Secure`;
    }

    

    constructor (private id:string){
        const config = this.getCookie("consentConfig")
        if(config){
            this.state = config;
            this.isNewUser = false;
        }
        else{
            this.isNewUser = true;
            this.state = {
                'ad_storage': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied',
                'ad_user_data':'denied',
                'ad_personalization': 'denied',
                'security_storage': 'denied'     
            }
            this.setCookie("consentConfig", this.state , this.consentConfigDuration)
        }


        this.head = document.head;
        this.analytics_lib = document.createElement("script");
        this.init_consent = document.createElement("script");
        this.init_GA = document.createElement("script");

        this.analytics_lib.setAttribute("src",`https://www.googletagmanager.com/gtag/js?id=${this.id}`);
        this.analytics_lib.setAttribute("async", "true");

        this.init_consent.setAttribute("data-cookieconsent", "ignore")
        
        this.init_consent.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            
            gtag('consent', 'default', ${JSON.stringify(this.state)});
        

            gtag('set', 'ads_data_redaction', true);
            gtag('set', 'url_passthrough', true);
        `

        this.init_GA.textContent = `
            gtag('js', new Date());
            gtag('config', '${this.id}', { send_page_view: false });
        `


        this.head.appendChild(this.init_consent); 

        this.analytics_lib.onload = () => {
            this.head.appendChild(this.init_GA); 
        };
        this.head.appendChild(this.analytics_lib); 



    }

    private pageView(){
        if (this.state.analytics_storage === 'granted') {
            window.gtag('event', 'page_view', {
                page_path: window.location.pathname,
                page_title: document.title,
            });
        }
    }

    private dispatchCustomEvent(key:ConsentEventKey,mode:ConsentEventMode){
        const event = new CustomEvent<ConsentUpdateEventDetail>('consent-updated', {
             detail: { key, mode, state: this.state, timestamp: Date.now().toString()} });
        window.dispatchEvent(event);
    }



    update(key:Options, mode:Mode){
        if(!window.dataLayer) throw new Error("The gtag function is not defined");

        this.state = {...this.state, [key]: mode}
        this.setCookie("consentConfig", this.state ,this.consentConfigDuration)
        window.gtag("consent", "update", { [key]: mode });

        this.pageView();
        this.dispatchCustomEvent(key,mode);

    }

    acceptAll() {

        try {
            if (!window.dataLayer) throw new Error("The gtag function is not defined");
            const v1 = Object.keys(this.state) as Options[];
            const v2 = v1.map((key) => [key ,"granted"])  
            this.state = Object.fromEntries(v2) as Config;
            window.gtag("consent", "update", this.state);
            this.setCookie("consentConfig", this.state, this.consentConfigDuration)
            this.pageView();
            this.dispatchCustomEvent("all","accept-all");

        }
        catch (error) {
            console.error("Error in acceptAll:", error);
        }

    }

    rejectAll(){
        try{
            if(!window.dataLayer) throw new Error("The gtag function is not defined");
            const v1 = Object.keys(this.state) as Options[];
            const v2 = v1.map((key) => [key ,"denied"]) 
            this.state = Object.fromEntries(v2) as Config;
            window.gtag("consent", "update", this.state);
            this.setCookie("consentConfig", this.state ,this.consentConfigDuration)
            this.dispatchCustomEvent("all","reject-all");
        }
        catch(error){
            console.error("Error in rejectAll:", error)
        }
    }

    isAllConsented(): boolean {
        return Object.values(this.state).every(value => value === 'granted');
    }
    
    isAllDenied(): boolean {
        return Object.values(this.state).every(value => value === 'denied');
    }

    updateMultiple(new_state:PartialConfig){
        try{
            this.state = {...this.state,...new_state}
            window.gtag("consent", "update", new_state);
            this.setCookie("consentConfig", this.state ,this.consentConfigDuration)
            Object.entries(new_state).forEach(([key, mode]) => {
                this.dispatchCustomEvent(key as Options, mode as Mode);
            });
            this.pageView();
        }
        catch(error){
            console.error("Error in updateMultiple:", error)
        }
    }


}

