import LandingTemplate from "./components/landing/LandingTemplate";
import { sampleData } from "./data/sampleData";

const Index = () => {
  // Replace sampleData with dynamically populated data from your scraper/LLM
  return <LandingTemplate data={sampleData} />;
};

export default Index;
