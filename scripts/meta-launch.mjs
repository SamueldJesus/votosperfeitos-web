import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const GRAPH_VERSION = "v24.0";
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;
const LANDING_URL = "https://votosperfeitos.avancoai.com.br/";
const ASSET_DIRECTORY = "/home/samuel/Documents/Codex/2026-09-14/fa/outputs/anuncios-votosperfeitos";
const CAMPAIGN_NAME = "VP | Vendas | Brasil | Criativos v1";
const URL_TAGS = "utm_source={{site_source_name}}&utm_medium={{placement}}&utm_campaign={{campaign.id}}&utm_content={{ad.id}}&utm_term={{adset.id}}";

const creatives = [
  {
    id: "palavras",
    feed: "feed-01-palavras-1080x1350.png",
    story: "stories-01-palavras-1080x1920.png",
    primaryText: "Encontrar palavras para os votos pode travar, mesmo quando a história está cheia de significado. O VotosPerfeitos transforma as respostas de 6 perguntas em 3 versões inéditas no tom escolhido. Os PDFs chegam por e-mail para você ler, escolher e dar o seu toque final antes do altar.",
    headline: "Transforme sua história em votos",
    description: "3 versões em PDF por R$47,00",
    callToAction: "LEARN_MORE",
  },
  {
    id: "memorias",
    feed: "feed-02-memorias-1080x1350.png",
    story: "stories-02-memorias-1080x1920.png",
    primaryText: "Um primeiro encontro, uma mania, um gesto de cuidado. São esses detalhes que fazem os votos soarem como uma história de verdade. Conte os momentos que importam em 6 perguntas. Escolha o tom e receba 3 versões personalizadas em PDF, prontas para ajustar e levar ao altar.",
    headline: "Memórias que viram palavras",
    description: "Escolha o tom. Receba 3 versões.",
    callToAction: "LEARN_MORE",
  },
  {
    id: "tres-versoes",
    feed: "feed-03-tres-versoes-1080x1350.png",
    story: "stories-03-tres-versoes-1080x1920.png",
    primaryText: "Três versões. Um tom escolhido por você. Tempo para comparar, combinar trechos e encontrar as palavras que parecem suas. Por R$47,00, o VotosPerfeitos cria os votos a partir das suas respostas e entrega 3 PDFs por e-mail. Pagamento único, sem assinatura.",
    headline: "3 versões de votos por R$47,00",
    description: "PDFs enviados por e-mail",
    callToAction: "SHOP_NOW",
  },
];

export function assertConfig(environment) {
  for (const name of ["META_ACCESS_TOKEN", "META_ACCOUNT_ID", "META_PAGE_ID", "META_PIXEL_ID"]) {
    if (!environment[name]) throw new Error(`${name} is required`);
  }
  if (!/^act_\d+$/.test(environment.META_ACCOUNT_ID)) throw new Error("META_ACCOUNT_ID must use the act_<id> format");
}

export function buildLaunchPlan(environment) {
  assertConfig(environment);
  return {
    campaign: {
      name: CAMPAIGN_NAME,
      objective: "OUTCOME_SALES",
      status: "PAUSED",
      buying_type: "AUCTION",
      special_ad_categories: [],
    },
    adset: {
      name: "Purchase | Broad | Brasil 23-44",
      daily_budget: 5000,
      billing_event: "IMPRESSIONS",
      optimization_goal: "OFFSITE_CONVERSIONS",
      bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      status: "PAUSED",
      promoted_object: { pixel_id: environment.META_PIXEL_ID, custom_event_type: "PURCHASE" },
      targeting: { geo_locations: { countries: ["BR"] }, age_min: 23, age_max: 44, genders: [1, 2] },
    },
    ads: creatives.map((creative) => ({
      name: `${creative.id} | copy-v1 | headline-v1`,
      status: "PAUSED",
      ...creative,
    })),
  };
}

class GraphClient {
  constructor(token) {
    this.token = token;
  }

  async request(path, { method = "GET", fields, body } = {}) {
    const url = new URL(`${GRAPH_BASE_URL}${path}`);
    if (fields) url.searchParams.set("fields", fields);
    const headers = { authorization: `Bearer ${this.token}` };
    let requestBody;
    if (body instanceof FormData) {
      requestBody = body;
    } else if (body) {
      headers["content-type"] = "application/x-www-form-urlencoded";
      requestBody = new URLSearchParams(Object.entries(body).map(([key, value]) => [key, typeof value === "string" ? value : JSON.stringify(value)]));
    }
    const response = await fetch(url, { method, headers, ...(requestBody ? { body: requestBody } : {}) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.error) {
      const error = result.error ?? {};
      if (error.code === 17 || error.code === 613 || error.error_subcode === 80004) {
        throw new Error("Meta rate limit reached; wait for the account usage window before retrying.");
      }
      throw new Error(`Meta API request failed (${error.code ?? response.status}): ${error.message ?? "unknown error"}`);
    }
    return result;
  }

  get(path, fields) { return this.request(path, { fields }); }
  post(path, body) { return this.request(path, { method: "POST", body }); }
}

async function uploadImage(graph, accountId, filename) {
  const bytes = await readFile(resolve(ASSET_DIRECTORY, filename));
  const form = new FormData();
  form.set("filename", new Blob([bytes], { type: "image/png" }), basename(filename));
  const result = await graph.post(`/${accountId}/adimages`, form);
  const image = Object.values(result.images ?? {})[0];
  if (!image?.hash) throw new Error(`Meta did not return an image hash for ${filename}`);
  return image.hash;
}

async function verifyPreflight(graph, environment) {
  const [account, page, pixel, campaigns] = await Promise.all([
    graph.get(`/${environment.META_ACCOUNT_ID}`, "id,name,currency,account_status"),
    graph.get(`/${environment.META_PAGE_ID}`, "id,name"),
    graph.get(`/${environment.META_PIXEL_ID}`, "id,name"),
    graph.get(`/${environment.META_ACCOUNT_ID}/campaigns`, "id,name,status,effective_status"),
  ]);
  if (account.currency !== "BRL") throw new Error("The selected ad account must use BRL.");
  if (!page.id || !pixel.id) throw new Error("The configured Page or Pixel is unavailable to this token.");
  if ((campaigns.data ?? []).some((campaign) => campaign.name === CAMPAIGN_NAME)) {
    throw new Error(`A campaign named ${CAMPAIGN_NAME} already exists; review it instead of duplicating it.`);
  }
}

function assetFeedSpec(ad, hashes) {
  return {
    images: [
      { hash: hashes[ad.feed], adlabels: [{ name: "feed" }] },
      { hash: hashes[ad.story], adlabels: [{ name: "story" }] },
    ],
    bodies: [{ text: ad.primaryText }],
    titles: [{ text: ad.headline }],
    descriptions: [{ text: ad.description }],
    link_urls: [{ website_url: LANDING_URL, display_url: "votosperfeitos.avancoai.com.br" }],
    call_to_action_types: [ad.callToAction],
    asset_customization_rules: [
      { customization_spec: { publisher_platforms: ["facebook", "instagram"], facebook_positions: ["feed"], instagram_positions: ["stream"] }, image_label: { name: "feed" } },
      { customization_spec: { publisher_platforms: ["facebook", "instagram"], facebook_positions: ["story"], instagram_positions: ["story"] }, image_label: { name: "story" } },
    ],
  };
}

async function verifyCreated(graph, environment, ids, expectedImageHashes) {
  const [campaign, adset, ads] = await Promise.all([
    graph.get(`/${ids.campaignId}`, "id,name,status,effective_status"),
    graph.get(`/${ids.adsetId}`, "id,name,status,effective_status,targeting,daily_budget"),
    graph.get(`/${environment.META_ACCOUNT_ID}/ads`, "id,name,status,effective_status,creative{id,name}"),
  ]);
  const createdAds = (ads.data ?? []).filter((ad) => ids.adIds.includes(ad.id));
  if (campaign.status !== "PAUSED" || adset.status !== "PAUSED" || createdAds.length !== 3 || createdAds.some((ad) => ad.status !== "PAUSED")) {
    throw new Error("Post-create verification did not find the expected paused campaign structure.");
  }
  if (!expectedImageHashes.every(Boolean)) throw new Error("One or more uploaded creative hashes are missing.");
  return { campaign: campaign.id, adset: adset.id, ads: createdAds.map((ad) => ad.id) };
}

export async function launch(environment = process.env) {
  const plan = buildLaunchPlan(environment);
  const graph = new GraphClient(environment.META_ACCESS_TOKEN);
  await verifyPreflight(graph, environment);

  const hashes = {};
  for (const filename of creatives.flatMap((creative) => [creative.feed, creative.story])) {
    hashes[filename] = await uploadImage(graph, environment.META_ACCOUNT_ID, filename);
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));
  }

  const campaign = await graph.post(`/${environment.META_ACCOUNT_ID}/campaigns`, plan.campaign);
  const adset = await graph.post(`/${environment.META_ACCOUNT_ID}/adsets`, { ...plan.adset, campaign_id: campaign.id });
  const adIds = [];
  for (const ad of plan.ads) {
    const creative = await graph.post(`/${environment.META_ACCOUNT_ID}/adcreatives`, {
      name: `VP | ${ad.id} | v1`,
      object_story_spec: { page_id: environment.META_PAGE_ID },
      asset_feed_spec: assetFeedSpec(ad, hashes),
      url_tags: URL_TAGS,
    });
    const createdAd = await graph.post(`/${environment.META_ACCOUNT_ID}/ads`, {
      name: ad.name,
      adset_id: adset.id,
      creative: { creative_id: creative.id },
      status: "PAUSED",
    });
    adIds.push(createdAd.id);
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));
  }

  const verified = await verifyCreated(graph, environment, { campaignId: campaign.id, adsetId: adset.id, adIds }, Object.values(hashes));
  console.log(JSON.stringify({ status: "PAUSED", ...verified }, null, 2));
  return verified;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  launch().catch((error) => {
    console.error(error instanceof Error ? error.message : "Meta campaign launch failed");
    process.exitCode = 1;
  });
}
