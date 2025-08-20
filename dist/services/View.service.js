"use strict";
// import Errors from '../libs/utils/Error';
// import { ViewInput, View } from '../libs/types/view'; // Corrected path if the folder is named 'schemas'
// import ViewModel from "../models/View.model";
// import { HttpCode } from '../libs/utils/Error';
// import { Message } from '../libs/utils/Error';
// class ViewService {
//     private readonly viewModel;
//     constructor() {
//         this.viewModel = ViewModel;
//     }
//     // Method to check view existence
//     public async checkViewExistence(input: ViewInput): Promise<View | null> {
//         const view = await this.viewModel
//             .findOne({ memberId: input.memberId, viewRefId: input.viewRefId })
//             .exec();
//         // Return null if view doesn't exist instead of throwing an error
//         return view ? view.toObject() : null;
//     }
//     // Method to insert a new member view
//     public async insertMemberView(input: ViewInput): Promise<View> {
//         try {
//             const createdView = await this.viewModel.create(input);
//             return createdView.toObject();
//         } catch (error) {
//             console.log("Error model: insertMemberView", error);
//             throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
//         }
//     }
// }
// export default ViewService;
