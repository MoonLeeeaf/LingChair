export default function isMobileUI() {
    const mobile = new URL(location.href).searchParams.get('mobile')
    if (mobile) return mobile == 'true'
    return /Mobi|Android|iPhone/i.test(navigator.userAgent)
}