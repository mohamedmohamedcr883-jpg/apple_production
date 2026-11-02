import { model } from "mongoose";
import offerSchema from "./offer.schema";
import { IOffer } from "../../utils/common/interfaces";

const Offer = model<IOffer>("Offer", offerSchema);
export default Offer;
