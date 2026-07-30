import { formatStorage } from "@/lib/quotes/format";
import type { IphoneModel } from "@/lib/quotes/types";

export function modelPageCopy(model: IphoneModel) {
  const storageList = model.storageOptions.map(formatStorage).join(", ");

  return {
    title: `Sælg ${model.name} — se bud lige nu`,
    description: `Sælg din ${model.name} og se hvor du får det bedste bud. iBud sammenligner estimater fra flere danske købere — og pejer dig det rigtige sted hen.`,
    lede: `Vælg lager og stand for din ${model.name}. Vi finder buddene og viser det bedste først.`,
    about: `Vil du sælge din ${model.name}? iBud samler estimater fra flere steder i Danmark, rangerer dem og sender dig videre. Du handler stadig direkte med køberen — vi står midt imellem som pegepind.`,
    storageNote: `${model.name} findes typisk i ${storageList}. Større lager giver som regel et højere bud, når standen ellers er den samme.`,
  };
}

export function modelFaqs(model: IphoneModel) {
  return [
    {
      question: `Hvad er min ${model.name} værd?`,
      answer: `Værdien afhænger af lager, stand og aktuelle bud. På iBud vælger du model, lager og stand — så viser vi estimater fra flere købere med det bedste bud først.`,
    },
    {
      question: `Køber iBud min ${model.name}?`,
      answer: `Nej. iBud køber ikke din telefon. Vi sammenligner estimater og pejer dig videre til det sted, der byder højest.`,
    },
    {
      question: "Er buddene endelige?",
      answer:
        "Nej. Buddene er estimater. Den endelige pris aftales typisk efter, at stedet har inspiceret telefonen.",
    },
    {
      question: "Hvad betyder stand for prisen?",
      answer:
        "Stand — om telefonen virker, skærmen er intakt, kosmetik og batteri — har stor betydning for buddet. Vær ærlig, så estimatet matcher det, du får efter vurdering.",
    },
  ];
}

/** Group models for hub listings (newest generations first). */
export function groupModelsByGeneration(models: IphoneModel[]) {
  const groups: { title: string; models: IphoneModel[] }[] = [
    { title: "iPhone 17", models: [] },
    { title: "iPhone 16", models: [] },
    { title: "iPhone 15", models: [] },
    { title: "iPhone 14", models: [] },
    { title: "iPhone 13", models: [] },
    { title: "iPhone 12", models: [] },
    { title: "iPhone 11", models: [] },
    { title: "iPhone X-serien", models: [] },
    { title: "iPhone SE", models: [] },
  ];

  for (const model of models) {
    const id = model.id;
    if (id.startsWith("iphone-17")) groups[0].models.push(model);
    else if (id.startsWith("iphone-16")) groups[1].models.push(model);
    else if (id.startsWith("iphone-15")) groups[2].models.push(model);
    else if (id.startsWith("iphone-14")) groups[3].models.push(model);
    else if (id.startsWith("iphone-13")) groups[4].models.push(model);
    else if (id.startsWith("iphone-12")) groups[5].models.push(model);
    else if (id.startsWith("iphone-11")) groups[6].models.push(model);
    else if (id.startsWith("iphone-x") || id === "iphone-xr" || id === "iphone-xs" || id === "iphone-xs-max")
      groups[7].models.push(model);
    else if (id.startsWith("iphone-se")) groups[8].models.push(model);
  }

  return groups.filter((g) => g.models.length > 0);
}
