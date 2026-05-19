export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
] as const;

export const SLOT_CATEGORIES = [
  { value: "parent",      label: "Parent" },
  { value: "grandparent", label: "Grandparent" },
  { value: "sibling",     label: "Sibling" },
  { value: "aunt",        label: "Aunt" },
  { value: "uncle",       label: "Uncle" },
  { value: "cousin",      label: "Cousin" },
  { value: "friend",      label: "Friend" },
  { value: "other",       label: "Other" },
] as const;
