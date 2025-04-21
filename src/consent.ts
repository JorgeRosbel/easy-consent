import { type Mode, 
    type Options, 
    Config, 
    type ConsentEventKey, 
    type ConsentEventMode, 
    ConsentUpdateEventDetail, 
    type PartialConfig } from "./types";


export class EasyConsent {
    public isNewUser:boolean
    public state:Config;
    private head:HTMLElement
    private analytics_lib:HTMLElement
    private init_consent:HTMLElement
    private init_GA:HTMLElement
    private consentConfigDuration = 180;
    private initialized = false;

    constructor(private id: string) {
        this.state = {
            ad_storage: "denied",
            analytics_storage: "denied",
            functionality_storage: "denied",
            personalization_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
            security_storage: "denied",
        }

        this.head = document.head
        this.analytics_lib = document.createElement("script")
        this.init_consent = document.createElement("script")
        this.init_GA = document.createElement("script")
    }


    private async setCookie(value: Config, days:number):Promise<void>{
        try{ 
            await cookieStore.set({
                name: "consentConfig",
                value: encodeURIComponent(JSON.stringify(value)),
                expires:Math.floor((Date.now() + 86400 * 1000 * days) / 1000),
                path: "/",
                sameSite : "Lax",
                secure: true,
                priority : "High"
            }) 
        }
        catch(error){ throw new Error(`Error creating the cookie: ${error.message}`) }
    }

    private async getCookie (name:string):Promise<Config | null>{
        try{
            const cookie = await cookieStore.get(name)
            if(!cookie || !cookie.value) return null

            return JSON.parse(decodeURIComponent(cookie.value))
        }
        catch(error){ throw new Error(`Error al acceder a la cookie ${name}`)}
    }

    private async initialize(): Promise<void> {
        if (this.initialized) return
    
        try {
          const config = await this.getCookie("consentConfig")
    
          if (config) {
            this.state = config
            this.isNewUser = false
          } else {
            this.isNewUser = true
            await this.setCookie(this.state, this.consentConfigDuration)
          }
    
          this.analytics_lib.setAttribute("src", `https://www.googletagmanager.com/gtag/js?id=${this.id}`)
          this.analytics_lib.setAttribute("async", "true")
    
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
    
          this.head.appendChild(this.init_consent)
    
          this.analytics_lib.onload = () => {
            this.head.appendChild(this.init_GA)
          }
    
          this.head.appendChild(this.analytics_lib)
          this.initialized = true
        } catch (error) {
          console.error("Error initializing EasyConsent:", error)
          throw error
        }
    }

    public static async create(id: string): Promise<EasyConsent> {
        const instance = new EasyConsent(id)
        await instance.initialize()
        return instance
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


    async update(key:Options, mode:Mode){
        if(!window.dataLayer) throw new Error("The gtag function is not defined");

        this.state = {...this.state, [key]: mode}
        await this.setCookie(this.state ,this.consentConfigDuration)
        window.gtag("consent", "update", { [key]: mode });

        this.pageView();
        this.dispatchCustomEvent(key,mode);

    }

    async acceptAll() {

        try {
            if (!window.dataLayer) throw new Error("The gtag function is not defined");
            const v1 = Object.keys(this.state) as Options[];
            const v2 = v1.map((key) => [key ,"granted"])  
            this.state = Object.fromEntries(v2) as Config;
            window.gtag("consent", "update", this.state);
            await this.setCookie(this.state, this.consentConfigDuration)
            this.pageView();
            this.dispatchCustomEvent("all","accept-all");

        }
        catch (error) {
            console.error("Error in acceptAll:", error);
        }

    }

    async rejectAll(){
        try{
            if(!window.dataLayer) throw new Error("The gtag function is not defined");
            const v1 = Object.keys(this.state) as Options[];
            const v2 = v1.map((key) => [key ,"denied"]) 
            this.state = Object.fromEntries(v2) as Config;
            window.gtag("consent", "update", this.state);
            await this.setCookie(this.state ,this.consentConfigDuration)
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

    async updateMultiple(new_state:PartialConfig){
        try{
            this.state = {...this.state,...new_state}
            window.gtag("consent", "update", new_state);
            await this.setCookie(this.state ,this.consentConfigDuration)
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


const consent = await EasyConsent.create("asdasdasd")

