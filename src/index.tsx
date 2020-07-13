import ForgeUI, {
  render,
  Fragment,
  Macro,
  Text,
  Image,
  Button,
  Form,
  TextField,
  CheckboxGroup,
  Checkbox,
  useAction,
  useState,
  useConfig,
  useProductContext,
} from "@forge/ui";
import api, { fetch } from "@forge/api";
// import { useContentProperty } from "@forge/ui-confluence";

// https://unsplash.com/documentation
const UNSPLASH_API_BASE = "https://api.unsplash.com/";

interface UnsplashJson {
  title: string;
  url: string;
}

const performUnsplashOp = async (unsplashUrl) => {
  console.log("performUnsplashOp::Making Unsplash API call...", unsplashUrl);

  const response = await api.fetch(unsplashUrl, {
    headers: { "Accept-Version": "v1" },
  });
  // console.log(response);

  if (!response.ok) {
    const errorMessage = await response.text();
    console.log("ERROR:", errorMessage);
    return { title: `FORGE API ERROR: ${errorMessage}`, url: "" };
  }

  const jsonResponse = await response.json();
  console.log(jsonResponse);

  const errors = jsonResponse.errors;
  if (errors) {
    console.log("ERROR:", errors);
    return { title: `FORGE API ERROR: ${errors[0]}`, url: "" };
  }

  const results = jsonResponse.results ? jsonResponse.results : jsonResponse;

  const { description, alt_description, urls } = results[0];
  // console.log(description, alt_description, urls);

  const functionResponse = {
    title: (description ? description + " - " : "") + (alt_description ? alt_description : ""),
    url: urls.regular, // raw, full, regular, small, thumb
  };
  return functionResponse;
};

const getUnsplashRandom = async (): Promise<UnsplashJson> => {
  const unsplashUrl = `${UNSPLASH_API_BASE}photos/random?count=1&client_id=${process.env.UNSPLASH_API_KEY}`;
  return performUnsplashOp(unsplashUrl);
};

const getUnsplashSearch = async (query = ""): Promise<UnsplashJson> => {
  const unsplashUrl = `${UNSPLASH_API_BASE}search/photos?query=${query}&per_page=1&client_id=${process.env.UNSPLASH_API_KEY}`;
  return performUnsplashOp(unsplashUrl);
};

// ImageCardProps interface which will be used by ImageCard component
interface ImageCardProps {
  title: string;
  src: string;
}

// ImageCard component containing text and image
const ImageCard = ({ title, src }: ImageCardProps) => {
  console.log(title, src);
  return (
    <Fragment>
      <Image src={src} alt={title} />
      <Text content={title} />
    </Fragment>
  );
};

const App = () => {
  const context = useProductContext();

  // const [chosenPic, setchosenPic] = useContentProperty("picture", { title: "", url: "" });
  const [{ title, url }, setImage] = useState({ title: "", url: "" });

  const [randomImage, setRandomImage] = useAction(async () => {
    const _ = await getUnsplashRandom();
    console.log(_);
    setImage(_);
    // if (_) setchosenPic(_);
  }, getUnsplashRandom);

  const [submitted, setSubmitted] = useAction(async (_, formData) => {
    console.log(formData);
    const __ = await getUnsplashSearch(formData["search"]);
    console.log(__);
    setImage(__);
    // if (__) setchosenPic(__);
    return formData;
  }, undefined);

  return (
    <Fragment>
      {/* <Text content={`All info about my context: ${JSON.stringify(context, null, 2)}`} /> */}

      <Form onSubmit={setSubmitted} submitButtonText="🔍 Search">
        <TextField name="search" label="Type keywords to search Unsplash, and press Enter" />
      </Form>

      <Button text="🔀 Random Image!" onClick={setRandomImage} />
      {/* {submitted && <Text content={JSON.stringify(submitted)} />} */}

      <ImageCard src={url} title={title} />
    </Fragment>
  );
};

// export const run = render(<App />);
export const run = render(<Macro app={<App />} />);
