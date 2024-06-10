import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const userUpdateUserProfile = ()=>{
    const queryClient = useQueryClient();
    const {mutateAsync:updateProfile, isPending:isUpdatingProfile } = useMutation({
		mutationFn: async(formData)=>{
			try{
            const res= await fetch(`/api/users/update`,{
				method: 'POST',
				headers:{
					"content-type":"application/json",
				},
				body: JSON.stringify(formData),

			});
			const data= await res.json();
			 if(!res.ok){
				throw new Error(data.error ||" something went wrong");
			 }
			 return data;
			}
			catch(error){
            throw new Error(error);
			}
		},
		onSuccess:()=>{
		  toast.success("profile updated successfully");
		  Promise.all([
			queryClient.invalidateQueries({queryKey:["authUser"]}),
			queryClient.invalidateQueries({queryKey:["userProfile"]}),
		  ])
		},
		onError:()=>{
			toast.error(error.message);
		}
	});
    return {updateProfile, isUpdatingProfile};
}
export default userUpdateUserProfile;