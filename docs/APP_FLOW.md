# App Flow Document — Shop With Mercy
_Version 1.0 — agreed June 2026_

See the original planning document for full detail. This is the committed reference copy.

**Two types of user:**
- **Shopper** — any visitor; can browse and add to cart anonymously; must be signed in to check out.
- **Admin (owner)** — single account; accesses a separate protected portal at `/admin`.

## Key flows summary

### Browsing
Home → Product Listing → Product Page → Add to cart

### Cart & Checkout
Cart → Sign-in/Sign-up gate → Delivery & Contact → Review Order → Paystack → Order Confirmed

### Customer Account
4 tabs: Orders · Wishlist · Dream Closet · Profile

### Admin Portal
4 sections: Products · Orders · Reviews · Analytics Dashboard

### Authentication
- Sign-up: name, email, password or Google OAuth
- Sign-in: email + password or Google OAuth; generic error messages (never reveal which field is wrong)
- Forgot password: email → reset link → new password screen

## Contact details embedded in flows
- Owner WhatsApp: `https://wa.me/2349049435149`
- TikTok: `https://www.tiktok.com/@shopwithmercy_`
- Support email: `support@shopwithmercywears.com`

## Error & edge cases
| Situation | Behaviour |
|---|---|
| Item sells out between add-to-cart and checkout | Flagged in cart — must be removed before proceeding |
| Two buyers purchase last unit simultaneously | Second order flagged; owner notified; stock set to zero |
| Paystack payment fails or is cancelled | Redirect back to Review Order; cart intact |
| Sign-up with existing email | Friendly prompt to sign in instead |
| Too many failed sign-in attempts | Temporary lockout with countdown |
| Pinterest OAuth fails | Dream Closet shows retry — no data lost |
| Admin accesses route without auth | Server redirects to admin sign-in |
