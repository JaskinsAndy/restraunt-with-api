export type Dish = {
  name: string;
  description: string;
  price: string;
  tags?: string[];
};

export type MenuSection = {
  title: string;
  lead: string;
  items: Dish[];
};

export const menuSections: MenuSection[] = [
  {
    title: "Mountain Larder",
    lead: "Heirloom produce from Tyrolean farms, tended by families we have partnered with for generations.",
    items: [
      {
        name: "Pinzgauer Lamb Saddle",
        description:
          "Juniper ash, black garlic tartelette, lakeshore pine oil, and ember-roasted celeriac purée.",
        price: "€46",
        tags: ["Signature", "Pasture Raised"],
      },
      {
        name: "Rißkogel Beetroot Terrine",
        description:
          "Layered alpine beet, smoked quark, pickled spruce tips, and hazelnut butter crumble.",
        price: "€24",
        tags: ["Vegetarian"],
      },
      {
        name: "Stone Pine Duck",
        description:
          "Aged Barbarie duck breast lacquered with pine honey, fermented cloudberries, and charred leek hearts.",
        price: "€39",
      },
      {
        name: "Tyrolean Blackened Venison",
        description:
          "Slow coal-fired venison, wild blueberry gastrique, roasted chestnuts, and cacao nib soil.",
        price: "€44",
      },
    ],
  },
  {
    title: "Rivers & Springs",
    lead: "Glacial-fed waters deliver pristine seafood, paired with alpine herbs and delicate broths.",
    items: [
      {
        name: "Glacier Trout Crudo",
        description:
          "Sliced river trout, green apple ice, fennel pollen, and smoked whey vinaigrette.",
        price: "€28",
        tags: ["Cold"],
      },
      {
        name: "Riesling Poached Char",
        description:
          "Spring onion nage, sorrel pearls, and fingerling potato mille-feuille.",
        price: "€33",
      },
      {
        name: "Chef's Alpine Bouillabaisse",
        description:
          "Langoustine, lake crayfish, and char in saffron-lucerne broth with toasted fennel brioche.",
        price: "€41",
      },
    ],
  },
  {
    title: "Sweet Summits",
    lead: "Confections celebrating alpine botanicals, mountain berries, and Austrian craft chocolate.",
    items: [
      {
        name: "Quell Spring Parfait",
        description:
          "Elderflower parfait, chamomile gel, preserved apricot, and sparkling tonic granita.",
        price: "€17",
        tags: ["Gluten Free"],
      },
      {
        name: "Sacher Reimagined",
        description:
          "Single-origin Zotter chocolate, blood orange pâte de fruit, and smoked salt Chantilly.",
        price: "€19",
      },
      {
        name: "Warm Kaiserschmarrn Soufflé",
        description:
          "Golden raisin caramel, alpine yogurt snow, and browned butter ice cream.",
        price: "€16",
      },
    ],
  },
];