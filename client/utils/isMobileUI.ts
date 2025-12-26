import data from "../data"

export default function isMobileUI() {
    return data.override_use_mobile_ui || /Mobi|Android|iPhone/i.test(navigator.userAgent)
}