import React, { useEffect } from 'react';
import { latVancouver, lngVancouver, searchRadius } from "../constants";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng
} from "use-places-autocomplete"; /** Reference : https://www.npmjs.com/package/use-places-autocomplete */ 

import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption
} from "@reach/combobox";
/** https://www.npmjs.com/package/@reach/combobox */

/**
 * Handle origin input of the search map
 * Take user's input and suggest auto-completed places 
 */
export function OriginSearch({ panTo, setOrigin, setOriginName, setIsOriginCurrent, setIsOriginValid, setCurrentLocation }) {
    /**
     * Set default input value as 'Current Location'
     */
    useEffect(() => {        
        setValue("Current Location", false);
    },[]);
    

    /**
     * Change origin input value as to the user input
     */
    const onChange = (event) => {
        setValue(event.target.value);
        setIsOriginCurrent(false);
        setIsOriginValid(false);
    };

    /**
     * Load Place Autocomplete prioritizing places around Vancouver
     */
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
        } = usePlacesAutocomplete({
            requestOptions: {
            location: { lat: () => latVancouver, lng: () => lngVancouver },
            radius: searchRadius,
            },
        });
    
    /**
     * Handle when user selects one of the places generated by auto place complete  
     */
    const originOnSelect = async (address) => {
            setIsOriginValid(true);
            clearSuggestions();
            setValue(address, false);
            if(address === "Current Location"){
                setCurrentAsOrgin();
            }else{
                try {
                    /**
                     * Receive coordinate of the address and save it as a search parameter 
                     */                    
                    const results = await getGeocode({ address });
                    const { lat, lng } = await getLatLng(results[0]);
                    setOrigin({lat, lng});
                    setOriginName(value);
                    panTo({ lat, lng });
                } catch (error) {
                    console.log("error");
                }
        }
    };
    /**
     * Set current location as a input parameter of the search
     */
    const setCurrentAsOrgin = () => {
        navigator.geolocation.getCurrentPosition(async function (position) {
            await setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
            await setOrigin({ lat: position.coords.latitude, lng: position.coords.longitude });
            panTo({ lat: position.coords.latitude, lng: position.coords.longitude });
        });
}



    return (
        <>
        <div className="originSearch">
            <Combobox onSelect={originOnSelect}
            >
                <ComboboxInput id="route-origin" value={value}
                    onChange={onChange}
                    disabled={!ready}
                    placeholder="Origin"
                    autocomplete={false}
                    />
                <ComboboxPopover>
                    <ComboboxList>
                        {status === "OK" && data.map(({ id, description }) => (
                            <ComboboxOption key={id} value={description} />
                        ))}
                        {status === "OK" && <ComboboxOption value={"Current Location"} />}
                    </ComboboxList>
                </ComboboxPopover>
            </Combobox>
        </div>
        </>
    );

    

    
    }

