export let config = {
	form_url: undefined,
	form_entries: {},
	getUrlTags(formData) {
		return '';
	},
};

//export let isConfigValid = false;

const configObj = require('../../config.json');

export const formEntries =
    [
        "date_found",
        "time_found",
        "date_admit",
        "time_admit",
        "details",
        "care",
        "circumstance",
        "state",
        "jurisdiction",
        "latitude",
        "longitude"
    ]

let htmlFormEntries = {}

export function setupConfig(){
    const warnings = validateEntries(configObj.form_entries)
    warnings.forEach(a => console.log(a));
}
/*
    This function takes in an array
 */
export function validateEntries(inputEntries){
    let warnings = []
    // ideally, the configObj matches the formEntriesHtml array one-for-one
    let unexpectedEntries = structuredClone(formEntries)
    let absentEntries = []
    htmlFormEntries = {}
    // for each of the saved values in the constant formEntries array
    formEntries.forEach((entry, index) => {
        // if the config has an entry in the formEntries list, that entry is not unexpected (it is expected)
        if (entry in inputEntries){
            // and therefore it is removed from the unexpectedEntries list
            unexpectedEntries[index] = null
            // if the entry hasn't been added to the html list, add it
            if(!(entry in htmlFormEntries)){
                htmlFormEntries[entry] =
                    {
                        name: entry.replace("_", "-"),
                        id: inputEntries[entry]
                    }
            }else {
                // if it has, we have a problem
                // don't replace the one already added, and throw a warning
                warnings.push(`Warning: The entry name "${entry}" is in the file more than once. Using the id of the first one only.`)
            }
        }else{
            // these are entries that should exist in the file, but don't.
            absentEntries.push(entry)
        }
    });
    if(absentEntries.length > 0) {
        warnings.push(`Error: The following entry names are missing from the configuration file: [${absentEntries}].`+
            `The form will be missing data, and might not submit correctly, even if it appears to.`)
    }
    unexpectedEntries = unexpectedEntries.filter(e => e != null)
    if(unexpectedEntries.length > 0){
        warnings.push(`Warning: The following entry names are extraneous, unexpected or may be misspelled: [${unexpectedEntries}]`)
    }
    config.form_url = configObj.form_url
    config.getUrlTags = formData => {
        let returnString = ""
        //we can ignore the key because we stored both the html entry name and the entry id in a sub-object keyed to the entry name
        Object.values(htmlFormEntries).forEach((entry) => {
            returnString += `&entry.${entry.id}=${formData.get(entry.name)}`;
        });
        return returnString;
    }
    return warnings

}
