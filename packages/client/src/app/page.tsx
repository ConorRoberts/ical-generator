import { AiFillGithub } from "react-icons/ai";
import Calendar from "./Calendar";
import UploadForm from "./UploadForm";

const Home = () => {
  return (
    <div className="sm:pb-96 py-8">
      <div className="bg-white">
        <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
          <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
            <div className="px-6 lg:px-0 lg:pt-4">
              <div className="mx-auto max-w-2xl">
                <div className="max-w-lg">
                  <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Don&apos;t Waste Time with Due Dates
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    Upload your course syllabus, and get back a file you can
                    import into your favourite calendar app!
                  </p>
                  <div className="mt-10 flex items-center gap-x-6">
                    <a
                      href="https://github.com/conorroberts/ical-generator"
                      className="rounded-full px-4 py-1 font-medium text-gray-700 bg-gray-200 flex text-sm hover:bg-gray-300 items-center gap-2 justify-center mx-auto"
                    >
                      <span>View on GitHub</span>
                      <AiFillGithub size={25} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
              <div
                className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 md:-mr-20 lg:-mr-36"
                aria-hidden="true"
              />
              <div className="shadow-lg md:rounded-3xl">
                <div className="bg-indigo-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
                  <div
                    className="absolute -inset-y-px left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-indigo-100 opacity-20 ring-1 ring-inset ring-white md:ml-20 lg:ml-36"
                    aria-hidden="true"
                  />
                  <div className="relative sm:py-24 py-16 sm:px-8 px-4 flex items-center justify-center">
                    <Calendar />
                    <div
                      className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 md:rounded-3xl"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
        </div>
        <div className="mx-auto max-w-3xl">
          <UploadForm />
        </div>
      </div>
    </div>
  );
};

export default Home;
