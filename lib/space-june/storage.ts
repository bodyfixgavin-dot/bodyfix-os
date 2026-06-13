export const KEYS={user:"space-june-user",reading:"space-june-reading",unlocks:"space-june-unlocks"};
export type SpaceUser={id:string;provider:"line"|"google"|"email";providerUserId:string;displayName:string;email?:string;createdAt:string};
export type SpaceReading={id:string;status:string;houseType:string;targetArea:string;direction:string;answers:Record<string,string>;createdAt:string};
