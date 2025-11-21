export default function isMobileUI() {
    return new URL(location.href).searchParams.get('mobile') == 'true' || /Mobi|Android|iPhone/i.test(navigator.userAgent)
}