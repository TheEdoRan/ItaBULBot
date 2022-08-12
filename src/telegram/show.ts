import type { Context } from "telegraf";
import { Markup } from "telegraf";
import { clear } from "typescript-memoize";

import {
	BulButton,
	FiberButton,
	FwaButton,
	GoBackButton,
	PcnButton,
	PcnLocalizeButton,
} from "./buttons";
import { editMessage, editMessageWithError } from "./utils";

import type { BulRegionApi } from "../api/types";
import { Fetch } from "../data/fetch";
import { getLevel, getRegionIdFromCityId } from "../data/utils";
import { formatLatestUpdate, formatLatestUpdateError } from "../format/data";
import { formatAddress, formatAddressNotFound } from "../format/data/address";
import { formatCityFiber, formatCityFwa } from "../format/data/city";
import { formatPcnData } from "../format/data/pcn";
import { formatRegionFiber, formatRegionFwa } from "../format/data/region";
import { insertAtIndex } from "../utils";

import type { Update } from "typegram";
import type { BulCityAndOf, FiberFwa } from "../data/types";
import type { BotActionContext } from "./types";

export const showLatestUpdate = async () => {
	try {
		const date = await Fetch.latestUpdate();
		return formatLatestUpdate(date.ws.date);
	} catch (e: any) {
		clear(["data"]);
		console.error(`showLatestUpdate error: ${e?.message}`);
		return formatLatestUpdateError();
	}
};

export const showFiberData = async (ctx: BotActionContext) => {
	const id = (ctx.chosenInlineResult?.result_id ||
		ctx.match.slice(1)[0]) as string;

	const level = getLevel(id);

	let message = "";

	try {
		const data = await Fetch.data(level, id);

		const buttons: any[][] = [[FwaButton(id)], [BulButton(id, "fiber")]];

		// City level.
		if (level === "city") {
			const cityData = data as BulCityAndOf;

			if (cityData.pcn) {
				buttons[0]?.push(PcnButton(id, "fiber"));
			}

			message = formatCityFiber(cityData);
			// Region level.
		} else {
			const regionData = data as BulRegionApi;
			message = formatRegionFiber(regionData);
		}

		// eslint-disable-next-line
		await editMessage(ctx, message, Markup.inlineKeyboard(buttons));
	} catch (e: any) {
		clear(["data"]);
		console.error(`showFiberData error: ${e?.message}`);
		await editMessageWithError(ctx);
	}
};

export const showFwaData = async (ctx: BotActionContext) => {
	const id = ctx.match.slice(1)[0] as string;
	const level = getLevel(id);

	let message = "";

	try {
		const data = await Fetch.data(level, id);

		const buttons: any[][] = [[FiberButton(id)], [BulButton(id, "fwa")]];

		// City level.
		if (level === "city") {
			const cityData = data as BulCityAndOf;

			if (cityData.pcn) {
				buttons[0]?.push(PcnButton(id, "fwa"));
			}

			message = formatCityFwa(cityData);
			// Region level.
		} else {
			const regionData = data as BulRegionApi;
			message = formatRegionFwa(regionData);
		}

		// eslint-disable-next-line
		await editMessage(ctx, message, Markup.inlineKeyboard(buttons));
	} catch (e: any) {
		clear(["data"]);
		console.error(`showFwaData error: ${e?.message}`);
		await editMessageWithError(ctx);
	}
};

export const showPcnData = async (ctx: BotActionContext) => {
	const [prevStatus, cityId] = ctx.match.slice(1) as [string, string];

	try {
		const { pcn: pcnData, city_name: cityName } = (await Fetch.data(
			"city",
			cityId
		)) as BulCityAndOf;
		const pcnCityId = pcnData!.sede_id;
		const { features: pcnFeatures } = await Fetch.pcnData(pcnCityId);

		let buttons = [
			[BulButton(cityId, "pcn")],
			[GoBackButton(cityId, prevStatus as FiberFwa)],
		];

		// Display localize PCN button only if there are coordinates for this
		// shelter.
		if (pcnFeatures?.length && pcnFeatures[0]!.geometry) {
			const [longitude, latitude] = pcnFeatures[0]!.geometry.coordinates;

			// Insert localize button before the "go back" one.
			buttons = insertAtIndex(buttons, 1, [
				PcnLocalizeButton({ latitude, longitude }),
			]);
		}

		await editMessage(
			ctx,
			formatPcnData(pcnData!, cityName),
			Markup.inlineKeyboard(buttons)
		);
	} catch (e: any) {
		clear(["data"]);
		console.error(`showPcnData error: ${e?.message}`);
		await editMessageWithError(ctx);
	}
};

export const showAddressData = async (ctx: Context<Update>) => {
	// Get info from result id.
	const [cityId, streetId, province, number] = ctx
		.chosenInlineResult!.result_id.match(/^address_(\d+)_(\d+)_(.+)_(.+)$/)!
		.slice(1) as [string, string, string, string];

	try {
		// Get egonId from API.
		const { IdCivico: egonId } = await Fetch.numberInfo(streetId, number);

		// Fetch info for this egon.
		const data = await Fetch.egonData(egonId);

		// If BUL API crashes somehow.
		if (!data.id_egon) {
			throw new Error("invalid response from BUL API");
		}

		// Get region id from city id, for BUL website button.
		const regionId = getRegionIdFromCityId(cityId)!;

		const buttons = [[BulButton({ regionId, cityId, egonId }, "address")]];

		await editMessage(
			ctx,
			formatAddress(data, province),
			Markup.inlineKeyboard(buttons)
		);
	} catch (e: any) {
		console.error(`showAddressData error: ${e?.message}`);
		if (
			e?.message ===
			"numberInfo: Could not fetch data for this house number."
		) {
			return editMessage(ctx, formatAddressNotFound(), undefined, false);
		}
		await editMessageWithError(ctx);
	}
};
