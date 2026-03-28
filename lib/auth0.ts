import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

function resolveBaseUrl(appBaseUrl?: string) {
	return appBaseUrl || process.env.APP_BASE_URL || "http://localhost:3000";
}

export const auth0 = new Auth0Client({
	onCallback: async (error, ctx) => {
		const appBaseUrl = resolveBaseUrl(ctx.appBaseUrl);

		if (error) {
			const message = typeof error.message === "string" ? error.message : "";
			const causeMessage =
				typeof (error as { cause?: { message?: string } }).cause?.message === "string"
					? (error as { cause?: { message?: string } }).cause?.message ?? ""
					: "";
			const combinedMessage = `${message} ${causeMessage}`.toLowerCase();

			if (combinedMessage.includes("blocked") || combinedMessage.includes("unauthorized")) {
				return NextResponse.redirect(new URL("/auth?error=blocked", appBaseUrl));
			}

			if (error.code === "invalid_state" || error.code === "missing_state") {
				return NextResponse.redirect(new URL("/auth?error=session_expired", appBaseUrl));
			}

			return NextResponse.redirect(new URL("/auth?error=auth_failed", appBaseUrl));
		}

		const returnTo = ctx.returnTo || "/dashboard";
		return NextResponse.redirect(new URL(returnTo, appBaseUrl));
	},
});