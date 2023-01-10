import Skeleton from '../../packages/components/skeleton';

export default function OrderDetailsSkeleton() {
	return <div className="yith-pos-order-details order-details-skeleton">

		<div className="header">
			<Skeleton className="order-number" variant="rectangular"/>

			<div className="details">
				<Skeleton className="detail" variant="text" randomWidth={{ min: 40, max: 50 }}/>
				<Skeleton className="detail" variant="text" randomWidth={{ min: 10, max: 30 }}/>
			</div>
		</div>

		<div className="lines">
			{[...Array( 3 ).keys()].map( _ => {
				return <div className="line" key={_}>
					<Skeleton className="image" variant="rectangular"/>
					<div className="name">
						<Skeleton className="name__skeleton" variant="title" randomWidth={{ min: 10, max: 30 }}/>
					</div>
					<Skeleton className="subtotal" variant="text"/>
					<Skeleton className="total" variant="title"/>
				</div>;
			} )}
		</div>

		<div className="total-row">
			<Skeleton className="name" variant="title"/>
			<Skeleton className="price" variant="rounded"/>
		</div>
	</div>
}
