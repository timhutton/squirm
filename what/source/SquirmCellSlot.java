// SquirmCellSlot.java

import java.applet.*;
import java.awt.*;

import SquirmCell;

public class SquirmCellSlot {

	protected boolean has_occupant;
	protected SquirmCell occupant;

	/// public constructor initializes size of grid
	public SquirmCellSlot()
	{
		has_occupant = false;
	}

	public void makeOccupied(SquirmCell occ)
	{
		//ASSERT(!has_occupant);  // how to assert in java?
		has_occupant = true;
		occupant = occ;
	}

	public void makeEmpty()
	{
		has_occupant = false;
	}

	public boolean queryEmpty()
	{
		return !has_occupant;
	}

	public SquirmCell getOccupant()
	{
		// safety check here would be good
		if(!has_occupant) ;

		return occupant;
	}

};