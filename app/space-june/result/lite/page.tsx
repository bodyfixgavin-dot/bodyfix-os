import SpaceJuneExperience from "../../SpaceJuneExperience";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string>>}){return <SpaceJuneExperience view="lite" searchParams={await searchParams}/>}
