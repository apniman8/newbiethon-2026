package com.example.newbie.domain.indoor.model;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.example.newbie.domain.indoor.exception.GraphDataInvalidException;
import org.junit.jupiter.api.Test;

class SelectablePlaceTest {

    @Test
    void rejectsBlankId() {
        assertThrows(GraphDataInvalidException.class, () -> new SelectablePlace(
                " ",
                "KTX Arrival Hall",
                "Start near the main KTX arrival concourse.",
                "N-1",
                PlaceType.ARRIVAL,
                true,
                false,
                0
        ));
    }

    @Test
    void rejectsPlaceThatCannotBeSelected() {
        assertThrows(GraphDataInvalidException.class, () -> new SelectablePlace(
                "KTX_ARRIVAL",
                "KTX Arrival Hall",
                "Start near the main KTX arrival concourse.",
                "N-1",
                PlaceType.ARRIVAL,
                false,
                false,
                0
        ));
    }
}
