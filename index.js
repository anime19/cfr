

class ElementHandler {

  constructor(flag) {
    self.flag = flag
  }
  element(element) {
    if (element.tagName == 'title') {
      if (self.flag) { element.setInnerContent("Animesh's Website") }
      else { element.setInnerContent("Animesh's LinkedIn'") }
    }
    else if (element.tagName == 'a') {
      if (element.getAttribute('id') == 'url') {
        if (self.flag) {
          element.setInnerContent("My Personal Website")
          element.setAttribute('href'  , 'https://anime19.github.io/')
          element.setAttribute('target','_blank')
          element.setAttribute("style", "background-color:green")

        } else {
          element.setInnerContent("My LinkedIn Profile")
          element.setAttribute('href', 'https://www.linkedin.com/in/animesh-shukla-142b30160/')
          element.setAttribute('target','_blank')
          element.setAttribute("style", "background-color:blue")

        }
      }
    }
    else if (element.tagName == 'h1') {
      if (element.getAttribute('id') == 'title') {
        if (self.flag) element.setInnerContent("Hi There I'm Animesh")
        else element.setInnerContent("Animesh's Linkedin")
      }
    }

    if (element.tagName == 'p') {
      if (element.getAttribute('id') == 'description') {
        if (self.flag) element.setInnerContent("Hi there! I'm Animesh Shukla an aspiring software engineer, please visit my Personal Website to know more about my skills and experience")
        else element.setInnerContent("Here's my Facebook")
      }
    }
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


async function handleRequest(request) {
  let url = 'https://cfw-takehome.developers.workers.dev/api/variants';
  let response = await fetch(url);

  if (response.ok) {
    let json = await response.json();
    let urls = json.variants;
    return await ABTesting(request, urls)
  } else {
    return new Response('No content from the fetch api', {
      headers: { 'content-type': 'text/plain' },
    })
  }
}

async function ABTesting(request, urls) {
  const NAME = 'experiment'
  const cookie = request.headers.get('cookie')
  if (cookie && cookie.includes(`${NAME}=control`)) {
    return await returnResponse(urls, true)
  } else if (cookie && cookie.includes(`${NAME}=test`)) {
    return await returnResponse(urls, false)
  } else {
    let group = Math.random() < 0.5 ? 'test' : 'control' 
    let response = group === 'control' ? await returnResponse(urls, true) : await returnResponse(urls, false)
    response.headers.append('Set-Cookie', `${NAME}=${group}; path=/`)
    return response
  }
}


async function returnResponse(urls, flag) {
  if (flag) {
    let response = await fetch(urls[0]);
    return new HTMLRewriter().on('*', new ElementHandler(flag)).transform(response)
  } else {
    let response = await fetch(urls[1]);
    return new HTMLRewriter().on('*', new ElementHandler(flag)).transform(response)
  }
}
