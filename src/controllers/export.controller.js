import {log} from "console"
import Review from '../models/Review.js';
import fs from "fs/promises"
import User from '../models/User.js';


async function crear(ruta,contenido) {
    try {
        await fs.writeFile(ruta,contenido)
        log("arichivo creado corretamente")
    } catch (error) {
        log(error)
    }
}


export const exportData = async (req, res, next) => {
    const path = "./src/exports/file.csv"
    try {

        const reviewId = req.params.id
        const review = await Review.find({"mediaId":reviewId});
        
        // const papas = review.map((m)=>{
        //     // const nombres = await User.findById({m.userId})
        //     return nombres
        
        // })

        


        
        try {
            let newReview = JSON.stringify(review,null,4)
            
            await crear(path,newReview)

        } catch (error) {
            log(error)
        }

        
        // log(review);
        return res.status(200).json({ success: true,review});
    } catch (err) { next(err); }
  };
  