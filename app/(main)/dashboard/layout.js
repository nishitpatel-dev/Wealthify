import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DashBoard from "./page";

const DashboardLayout = () => {
  return (
    <div className="px-5">
      <h1 className="text-6xl font-bold gradient-title mb-5">Dashboard</h1>
      <Suspense
        fallback={
          <>
            <Skeleton style={{ width: "100%", height: "150px" }} />
            <div className=" flex flex-col md:flex-row">
              <div className=" w-full md:w-738 mt-4">
                <Skeleton height={400} />
              </div>
              <div className=" w-full md:w-738 mt-4 md:ml-4">
                <Skeleton height={400} />
              </div>
            </div>
            <Skeleton
              style={{
                width: "100%",
                height: "400px",
                marginTop: "1rem",
              }}
            />
          </>
        }
      >
        <DashBoard />
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
