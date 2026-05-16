import SEO from '../../components/SEO';

const Charter = () => (
  <div className="container-custom py-24 max-w-3xl mx-auto space-y-12">
      <SEO title="Charter" description="Tohnee.ai Charter — our mission to ensure AGI benefits all of humanity." path="/charter" />
      <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-black mb-12">Charter</h1>
    
    <div className="prose prose-lg prose-gray">
      <p className="lead text-xl font-light">
        Tohnee.ai’s mission is to ensure that artificial general intelligence (AGI)—by which we mean highly autonomous systems that outperform humans at most economically valuable work—benefits all of humanity. We will attempt to directly build safe and beneficial AGI, but will also consider our mission fulfilled if our work aids others to achieve this outcome.
      </p>

      <h3>Broadly Distributed Benefits</h3>
      <p>
        We commit to use any influence we obtain over AGI’s deployment to ensure it is used for the benefit of all, and to avoid enabling uses of AI or AGI that harm humanity or unduly concentrate power.
      </p>
      <p>
        Our primary fiduciary duty is to humanity. We anticipate needing to marshal substantial resources to fulfill our mission, but we will always diligently act to minimize conflicts of interest among our employees and stakeholders that could compromise broad benefit.
      </p>

      <h3>Long-term Safety</h3>
      <p>
        We are committed to doing the research required to make AGI safe, and to driving the broad adoption of such research across the AI community.
      </p>
      <p>
        We are concerned about late-stage AGI development becoming a competitive race without time for adequate safety precautions. Therefore, if a value-aligned, safety-conscious project comes close to building AGI before we do, we commit to stop competing with and start assisting this project.
      </p>

      <h3>Technical Leadership</h3>
      <p>
        To be effective at addressing AGI’s impact on society, Tohnee.ai must be on the cutting edge of AI capabilities—policy and safety advocacy alone are insufficient.
      </p>
      <p>
        We believe that AI will have broad societal impact before AGI, and we will strive to lead in those areas that are directly aligned with our mission and expertise.
      </p>

      <h3>Cooperative Orientation</h3>
      <p>
        We will actively cooperate with other research and policy institutions; we seek to create a global community working together to address AGI’s global challenges.
      </p>
      <p>
        We are committed to providing public goods that help society navigate the path to AGI. Today this includes publishing most of our AI research, but we expect that safety and security concerns will reduce our traditional publishing in the future, while increasing the importance of sharing safety, policy, and standards research.
      </p>
    </div>
  </div>
);

export default Charter;
