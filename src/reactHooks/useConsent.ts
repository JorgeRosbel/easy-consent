import { useState } from 'react'
import { type Options, Config, Mode } from '../types';
import { EasyConsent } from '../consent';

/**
 * This hook provides a way to manage consent choices for Google Analytics and related services.
 * It utilizes the EasyConsent class to handle the consent state and updates.
 * 
 * @param consent - An instance of EasyConsent, which manages the consent state and updates.
 * @returns An object containing the current consent choices, functions to handle individual choices, change mode, accept all, and reject all.
 */
export const useConsent = (consent:EasyConsent) => {

    const [choices,setChoices] = useState<Config>(consent.state);

    /**
     * Function to handle the change of a single consent choice.
     * 
     * @param key - The key of the consent option to change.
     * @param value - The new value for the consent option.
     * @returns A function that updates the consent state and the local state.
     */
    const changeChoice = (key:Options, value:Mode) => {
        return () => {
            consent.update(key,value)
            setChoices({...choices, [key]: value})
        }
    }

    /**
     * Function to toggle the mode of a consent option.
     * 
     * @param mode - The current mode of the consent option.
     * @returns The opposite mode of the given mode.
     */
    const toggleMode = (mode:Mode) => mode === "granted" ? "denied" : "granted"

    /**
     * Function to accept all consent options.
     * This function updates the consent state to grant all options and updates the local state.
     */
    const grantAll = () => {
        consent.acceptAll();
        setChoices(consent.state)
    }

    /**
     * Function to reject all consent options.
     * This function updates the consent state to deny all options and updates the local state.
     */
    const denyAll = () => {
        consent.rejectAll();
        setChoices(consent.state)
    }


    /**
     * Function to handle the change of multiple consent choices.
     * 
     * @param new_values - An object containing the new values for the consent options.
     * @returns A function that updates the consent state and the local state.
     */
    const updateChoices = (new_values:Partial<Config>) => {
        return () => {
            consent.updateMultiple(new_values);
            setChoices({...consent.state,...new_values})
        }
    }

    return {
        choices,
        changeChoice,
        updateChoices,
        toggleMode,
        grantAll, 
        denyAll
    }

}


