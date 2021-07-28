export const toQueryString = (obj) => {
  return Object.keys(obj)
    .map((prop) => `${prop}=${encodeURIComponent(obj[prop])}`)
    .join("&");
};

export const getTeamsQueryParameters = () => getQueryParameters("#")

export const getQueryParameters = (sep = "?") => {
  const queryParamsString = window.location.href.split(sep)[1];
  if (queryParamsString === undefined) {
    return null;
  }
  const components = queryParamsString.split("&");
  const res = {};
  components.forEach((component) => {
    const splat = component.split("=", 2);
    res[splat[0]] = decodeURIComponent(splat[1]);
  });
  return res;
};

export const parseJwt = (jwtString) => {
  [b64header, b64payload, sig] = jwtString.split(".");
  return {
    header: JSON.parse(atob(b64header)),
    payload: JSON.parse(atob(b64payload)),
    sig,
  };
};

export const callBackendAsync = (method, url, body, contentType) => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        resolve(request.responseText)
      }
    }
    request.open(method, url, true)
    if (contentType) {
      request.setRequestHeader("content-type", contentType)
    }
    request.send(body)
  })
}

export const createElement = (spec) => {
  if (Array.isArray(spec)) {
    return spec.map(childSpec => createElement(childSpec))
  }
  const type = spec.elt || spec.element || spec.tag
  const { attributes, children, content, parent } = spec
  const element = document.createElement(type)
  if (content) {
    element.innerHTML = content
  }
  if (attributes) {
    Object.keys(attributes).forEach(attribute => {
      element[attribute] = attributes[attribute]
    })
  }
  if (children) {
    children.forEach(childSpec => {
      childSpec.parent = element
      createElement(childSpec)
    })
  }
  if (parent) {
    parent.appendChild(element)
  }
  return element
}