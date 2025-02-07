
/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cookie-consent-js
 * License: MIT, see file 'LICENSE'
 */

class CookieConsent {
    constructor(props) {
        this.props = {
            buttonPrimaryClass: "btn btn-primary",
            buttonSecondaryClass: "btn btn-secondary",
            privacyPolicyUrl: "privacy-policy.html",
            autoShowModal: true,
            lang: navigator.language,
            blockAccess: false,
            position: "right",
            postSelectionCallback: undefined,
            content: {
                de: {
                    title: "Cookie-Einstellungen",
                    body: "Wir nutzen Cookies, um Inhalte zu personalisieren und die Zugriffe auf unsere Website zu analysieren. " +
                        "Sie können wählen, ob Sie nur für die Funktion der Website notwendige Cookies akzeptieren oder auch " +
                        "Tracking-Cookies zulassen möchten. Weitere Informationen finden Sie in unserer --privacy-policy--.",
                    privacyPolicy: "Datenschutzerklärung",
                    buttonAcceptAll: "Alle Cookies akzeptieren",
                    buttonAcceptTechnical: "Nur technisch notwendige Cookies akzeptieren"
                },
                en: {
                    title: "Cookie settings",
                    body: "We use cookies to personalize content and analyze access to our website. " +
                        "You can choose whether you only accept cookies that are necessary for the functioning of the website " +
                        "or whether you also want to allow tracking cookies. For more information, please refer to our --privacy-policy--.",
                    privacyPolicy: "privacy policy",
                    buttonAcceptAll: "Accept all cookies",
                    buttonAcceptTechnical: "Only accept technically necessary cookies"
                }
            },
            cookieName: "cookie-consent-tracking-allowed",
            modalId: "cookieConsentModal"
        }
        Object.assign(this.props, props);
        this.initLanguage();
        this.initializeModal();
    }

    initLanguage() {
        this.lang = this.props.lang.split('-')[0];
        if (!this.props.content[this.lang]) {
            this.lang = "en"; // fallback to English
        }
    }

    initializeModal() {
        const _t = this.props.content[this.lang];
        const linkPrivacyPolicy = `<a href="${this.escapeHtml(this.props.privacyPolicyUrl)}">${_t.privacyPolicy}</a>`;
        let modalClass = "cookie-consent-modal";
        if (this.props.blockAccess) {
            modalClass += " block-access";
        }
        const modalHeader = `<h3 class="modal-title">${_t.title}</h3>`;
        const modalBody = _t.body.replace(/--privacy-policy--/, linkPrivacyPolicy);
        const modalFooter = `<div class='buttons'>
            <button class='btn-accept-necessary ${this.props.buttonSecondaryClass}'>${_t.buttonAcceptTechnical}</button>
            <button class='btn-accept-all ${this.props.buttonPrimaryClass}'>${_t.buttonAcceptAll}</button>
        </div>`;
        this.modalContent = `<div class="${modalClass}">
            <div class="modal-content-wrap ${this.props.position}">
                <div class="modal-content">
                    <div class="modal-header">${modalHeader}</div>
                    <div class="modal-body">${modalBody}</div>
                    <div class="modal-footer">${modalFooter}</div>
                </div>
            </div>
        </div>`;
    }

    setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toUTCString()}`;
        }
        document.cookie = `${name}=${encodeURIComponent(value)}${expires}; Path=/; SameSite=Strict; Secure`;
    }

    getCookie(name) {
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length));
            }
        }
        return null;
    }

    removeCookie(name) {
        document.cookie = `${name}=; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure`;
    }

    documentReady(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    hideDialog() {
        this.modal.style.display = "none";
    }

    showDialog() {
        this.documentReady(() => {
            this.modal = document.getElementById(this.props.modalId);
            if (!this.modal) {
                this.modal = document.createElement("div");
                this.modal.id = this.props.modalId;
                this.modal.innerHTML = this.modalContent;
                document.body.append(this.modal);
                this.modal.querySelector(".btn-accept-necessary").addEventListener("click", () => {
                    this.setCookie(this.props.cookieName, "false", 365);
                    this.hideDialog();
                    this.props.postSelectionCallback && this.props.postSelectionCallback();
                });
                this.modal.querySelector(".btn-accept-all").addEventListener("click", () => {
                    this.setCookie(this.props.cookieName, "true", 365);
                    this.hideDialog();
                    this.props.postSelectionCallback && this.props.postSelectionCallback();
                });
            } else {
                this.modal.style.display = "block";
            }
        });
    }

    reset() {
        this.removeCookie(this.props.cookieName);
        this.showDialog();
    }

    trackingAllowed() {
        return this.getCookie(this.props.cookieName) === "true";
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}

