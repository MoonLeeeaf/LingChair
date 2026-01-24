import data from "../data.ts"

const searchParams = new URL(location.href).searchParams

export default function isMobileUI() {
    return data.override_use_mobile_ui || searchParams.get('mobile') == 'true' || /Mobi|Android|iPhone/i.test(navigator.userAgent)
}
