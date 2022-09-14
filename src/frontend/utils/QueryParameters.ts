export const getQueryParameters = (sep: string = "?") => {
  const queryParamsString = window.location.href.split(sep)[1];
  if (queryParamsString === undefined) {
    return {};
  }
  const components = queryParamsString.split("&");
  const res: {[key: string]: string} = {};
  components.forEach((component) => {
    const splat = component.split("=", 2);
    res[splat[0]] = decodeURIComponent(splat[1]);
  });
  return res;
};

export const toQueryString = (obj: any) => {
  return Object.keys(obj)
    .map((prop) => `${prop}=${encodeURIComponent(obj[prop])}`)
    .join("&");
};

export const getTeamsQueryParameters = () => getQueryParameters("#")
